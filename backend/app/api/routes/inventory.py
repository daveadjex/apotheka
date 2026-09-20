import uuid
from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import CurrentUser, require_roles
from app.db.session import get_db
from app.models.audit import write_audit_log
from app.models.inventory import InventoryItem, Supplier
from app.models.user import UserRole
from app.schemas.inventory import (
    InventoryItemAdjust,
    InventoryItemCreate,
    InventoryItemOut,
    SupplierCreate,
    SupplierOut,
)

router = APIRouter(prefix="/api/inventory", tags=["inventory"])

WRITE_ROLES = (UserRole.PHARMACY_OWNER, UserRole.INVENTORY_MANAGER)
READ_ROLES = (UserRole.PHARMACY_OWNER, UserRole.INVENTORY_MANAGER, UserRole.PHARMACIST, UserRole.CASHIER)


@router.get("", response_model=list[InventoryItemOut])
async def list_inventory(
    branch_id: uuid.UUID | None = None,
    low_stock_only: bool = False,
    expiring_within_days: int | None = Query(default=None, ge=1),
    search: str | None = None,
    current_user: CurrentUser = Depends(require_roles(*READ_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(InventoryItem)
        .options(selectinload(InventoryItem.drug))
        .where(InventoryItem.tenant_id == current_user.tenant_id)
    )
    if branch_id:
        stmt = stmt.where(InventoryItem.branch_id == branch_id)
    if low_stock_only:
        stmt = stmt.where(InventoryItem.quantity_on_hand <= InventoryItem.reorder_threshold)
    if expiring_within_days:
        cutoff = date.today() + timedelta(days=expiring_within_days)
        stmt = stmt.where(InventoryItem.expiry_date <= cutoff)

    result = await db.execute(stmt.order_by(InventoryItem.expiry_date))
    items = result.scalars().all()

    if search:
        needle = search.lower()
        items = [
            i for i in items
            if needle in i.drug.generic_name.lower()
            or (i.drug.brand_name and needle in i.drug.brand_name.lower())
        ]
    return items


@router.post("", response_model=InventoryItemOut, status_code=201)
async def create_inventory_item(
    payload: InventoryItemCreate,
    current_user: CurrentUser = Depends(require_roles(*WRITE_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    item = InventoryItem(tenant_id=current_user.tenant_id, **payload.model_dump())
    db.add(item)
    await write_audit_log(
        db,
        tenant_id=current_user.tenant_id,
        actor_user_id=current_user.id,
        action="INVENTORY_ITEM_CREATED",
        entity_type="inventory_item",
        entity_id=item.id,
        metadata={"batch_number": item.batch_number, "quantity": item.quantity_on_hand},
    )
    await db.commit()
    await db.refresh(item, attribute_names=["drug"])
    return item


@router.patch("/{item_id}/adjust", response_model=InventoryItemOut)
async def adjust_stock(
    item_id: uuid.UUID,
    payload: InventoryItemAdjust,
    current_user: CurrentUser = Depends(require_roles(*WRITE_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(InventoryItem)
        .options(selectinload(InventoryItem.drug))
        .where(InventoryItem.id == item_id, InventoryItem.tenant_id == current_user.tenant_id)
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")

    new_quantity = item.quantity_on_hand + payload.delta
    if new_quantity < 0:
        raise HTTPException(status_code=400, detail="Adjustment would result in negative stock")

    previous_quantity = item.quantity_on_hand
    item.quantity_on_hand = new_quantity

    await write_audit_log(
        db,
        tenant_id=current_user.tenant_id,
        actor_user_id=current_user.id,
        action="INVENTORY_ADJUSTED",
        entity_type="inventory_item",
        entity_id=item.id,
        metadata={
            "delta": payload.delta,
            "reason": payload.reason,
            "previous_quantity": previous_quantity,
            "new_quantity": new_quantity,
        },
    )
    await db.commit()
    await db.refresh(item, attribute_names=["drug"])
    return item


@router.get("/suppliers", response_model=list[SupplierOut])
async def list_suppliers(
    current_user: CurrentUser = Depends(require_roles(*READ_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Supplier).where(Supplier.tenant_id == current_user.tenant_id))
    return result.scalars().all()


@router.post("/suppliers", response_model=SupplierOut, status_code=201)
async def create_supplier(
    payload: SupplierCreate,
    current_user: CurrentUser = Depends(require_roles(*WRITE_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    supplier = Supplier(tenant_id=current_user.tenant_id, **payload.model_dump())
    db.add(supplier)
    await db.commit()
    await db.refresh(supplier)
    return supplier
