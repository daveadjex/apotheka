import json
import uuid

from fastapi import APIRouter, Depends, HTTPException
from redis.asyncio import Redis
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import CurrentUser, require_roles
from app.db.redis import get_redis
from app.db.session import get_db
from app.models.audit import write_audit_log
from app.models.inventory import InventoryItem
from app.models.sales import Sale, SaleItem
from app.models.user import UserRole
from app.schemas.pos import BarcodeLookupResult, CheckoutRequest, SaleOut

router = APIRouter(prefix="/api/pos", tags=["pos"])

CHECKOUT_ROLES = (UserRole.PHARMACY_OWNER, UserRole.CASHIER, UserRole.PHARMACIST)
IDEMPOTENCY_TTL_SECONDS = 60 * 60 * 24


@router.get("/lookup/{barcode}", response_model=BarcodeLookupResult)
async def lookup_by_barcode(
    barcode: str,
    branch_id: uuid.UUID,
    current_user: CurrentUser = Depends(require_roles(*CHECKOUT_ROLES)),
    db: AsyncSession = Depends(get_db),
    redis_client: Redis = Depends(get_redis),
):
    cache_key = f"barcode:{current_user.tenant_id}:{branch_id}:{barcode}"
    cached = await redis_client.get(cache_key)
    if cached:
        return BarcodeLookupResult(**json.loads(cached))

    result = await db.execute(
        select(InventoryItem)
        .join(InventoryItem.drug)
        .options(selectinload(InventoryItem.drug))
        .where(
            InventoryItem.tenant_id == current_user.tenant_id,
            InventoryItem.branch_id == branch_id,
        )
    )
    items = result.scalars().all()
    match = next((i for i in items if i.drug.ndc_code == barcode), None)
    if not match:
        raise HTTPException(status_code=404, detail="Product not found for this barcode")

    payload = BarcodeLookupResult(
        inventory_item_id=match.id,
        generic_name=match.drug.generic_name,
        brand_name=match.drug.brand_name,
        unit_price=float(match.unit_price),
        quantity_on_hand=match.quantity_on_hand,
        requires_rx=match.drug.requires_rx,
    )
    await redis_client.set(cache_key, payload.model_dump_json(), ex=300)
    return payload


@router.post("/checkout", response_model=SaleOut, status_code=201)
async def checkout(
    payload: CheckoutRequest,
    current_user: CurrentUser = Depends(require_roles(*CHECKOUT_ROLES)),
    db: AsyncSession = Depends(get_db),
    redis_client: Redis = Depends(get_redis),
):
    idem_key = f"checkout:{current_user.tenant_id}:{payload.idempotency_key}"
    existing_sale_id = await redis_client.get(idem_key)
    if existing_sale_id:
        result = await db.execute(
            select(Sale).options(selectinload(Sale.items)).where(Sale.id == uuid.UUID(existing_sale_id))
        )
        sale = result.scalar_one_or_none()
        if sale:
            return sale

    item_ids = [i.inventory_item_id for i in payload.items]
    result = await db.execute(
        select(InventoryItem)
        .where(InventoryItem.id.in_(item_ids), InventoryItem.tenant_id == current_user.tenant_id)
        .with_for_update()
    )
    inventory_by_id = {i.id: i for i in result.scalars().all()}

    subtotal = 0.0
    sale_items: list[SaleItem] = []
    for line in payload.items:
        inv_item = inventory_by_id.get(line.inventory_item_id)
        if not inv_item:
            raise HTTPException(status_code=404, detail=f"Inventory item {line.inventory_item_id} not found")
        if inv_item.quantity_on_hand < line.quantity:
            raise HTTPException(
                status_code=409,
                detail=f"Insufficient stock for batch {inv_item.batch_number} "
                       f"(have {inv_item.quantity_on_hand}, need {line.quantity})",
            )

        # Hook point for the Clinical Interaction Engine: call the AI
        # service here with (patient_id, drug_id) before allowing a
        # prescription item through, and block on 'contraindicated'/'major'.
        # if line.prescription_id:
        #     await check_interactions(patient_id=payload.patient_id, drug_id=inv_item.drug_id)

        line_total = float(inv_item.unit_price) * line.quantity
        subtotal += line_total
        inv_item.quantity_on_hand -= line.quantity

        sale_items.append(
            SaleItem(
                inventory_item_id=inv_item.id,
                prescription_id=line.prescription_id,
                quantity=line.quantity,
                unit_price=inv_item.unit_price,
                line_total=line_total,
            )
        )

    patient_copay = max(subtotal - payload.insurance_covered, 0)
    total = patient_copay + payload.insurance_covered + payload.tax

    sale = Sale(
        tenant_id=current_user.tenant_id,
        branch_id=payload.branch_id,
        cashier_id=current_user.id,
        patient_id=payload.patient_id,
        subtotal=subtotal,
        insurance_covered=payload.insurance_covered,
        patient_copay=patient_copay,
        tax=payload.tax,
        total=total,
        payment_method=payload.payment_method,
        items=sale_items,
    )
    db.add(sale)
    await db.flush()

    await write_audit_log(
        db,
        tenant_id=current_user.tenant_id,
        actor_user_id=current_user.id,
        action="SALE_COMPLETED",
        entity_type="sale",
        entity_id=sale.id,
        metadata={"total": total, "payment_method": payload.payment_method, "item_count": len(sale_items)},
    )

    await db.commit()
    await db.refresh(sale, attribute_names=["items"])

    await redis_client.set(idem_key, str(sale.id), ex=IDEMPOTENCY_TTL_SECONDS)
    return sale
