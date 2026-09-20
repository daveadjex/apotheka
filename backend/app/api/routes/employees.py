import uuid
from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentUser, require_roles
from app.db.session import get_db
from app.models.audit import write_audit_log
from app.models.employee import PerformanceMetric, Shift
from app.models.user import UserRole
from app.schemas.employee import PerformanceMetricOut, ShiftCreate, ShiftOut

router = APIRouter(prefix="/api/employees", tags=["employees"])

SCHEDULE_WRITE_ROLES = (UserRole.PHARMACY_OWNER,)
SCHEDULE_READ_ROLES = (
    UserRole.PHARMACY_OWNER,
    UserRole.PHARMACIST,
    UserRole.CASHIER,
    UserRole.INVENTORY_MANAGER,
)


@router.get("/shifts", response_model=list[ShiftOut])
async def list_shifts(
    branch_id: uuid.UUID | None = None,
    user_id: uuid.UUID | None = None,
    current_user: CurrentUser = Depends(require_roles(*SCHEDULE_READ_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Shift).where(Shift.tenant_id == current_user.tenant_id)
    if branch_id:
        stmt = stmt.where(Shift.branch_id == branch_id)
    if user_id:
        stmt = stmt.where(Shift.user_id == user_id)
    result = await db.execute(stmt.order_by(Shift.starts_at))
    return result.scalars().all()


@router.post("/shifts", response_model=ShiftOut, status_code=201)
async def create_shift(
    payload: ShiftCreate,
    current_user: CurrentUser = Depends(require_roles(*SCHEDULE_WRITE_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    overlap_stmt = select(Shift).where(
        Shift.tenant_id == current_user.tenant_id,
        Shift.user_id == payload.user_id,
        and_(Shift.starts_at < payload.ends_at, Shift.ends_at > payload.starts_at),
    )
    conflict = (await db.execute(overlap_stmt)).scalar_one_or_none()
    if conflict:
        raise HTTPException(
            status_code=409,
            detail=f"Employee already has a shift from {conflict.starts_at} to {conflict.ends_at}",
        )

    shift = Shift(tenant_id=current_user.tenant_id, **payload.model_dump())
    db.add(shift)
    await write_audit_log(
        db,
        tenant_id=current_user.tenant_id,
        actor_user_id=current_user.id,
        action="SHIFT_CREATED",
        entity_type="shift",
        entity_id=shift.id,
        metadata={"user_id": str(payload.user_id), "starts_at": payload.starts_at.isoformat()},
    )
    await db.commit()
    await db.refresh(shift)
    return shift


@router.delete("/shifts/{shift_id}", status_code=204)
async def delete_shift(
    shift_id: uuid.UUID,
    current_user: CurrentUser = Depends(require_roles(*SCHEDULE_WRITE_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Shift).where(Shift.id == shift_id, Shift.tenant_id == current_user.tenant_id)
    )
    shift = result.scalar_one_or_none()
    if not shift:
        raise HTTPException(status_code=404, detail="Shift not found")

    await write_audit_log(
        db,
        tenant_id=current_user.tenant_id,
        actor_user_id=current_user.id,
        action="SHIFT_DELETED",
        entity_type="shift",
        entity_id=shift.id,
        metadata={"user_id": str(shift.user_id)},
    )
    await db.delete(shift)
    await db.commit()


@router.get("/performance", response_model=list[PerformanceMetricOut])
async def list_performance(
    user_id: uuid.UUID | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    current_user: CurrentUser = Depends(require_roles(*SCHEDULE_READ_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(PerformanceMetric).where(PerformanceMetric.tenant_id == current_user.tenant_id)
    if user_id:
        stmt = stmt.where(PerformanceMetric.user_id == user_id)
    if start_date:
        stmt = stmt.where(PerformanceMetric.metric_date >= start_date)
    if end_date:
        stmt = stmt.where(PerformanceMetric.metric_date <= end_date)
    result = await db.execute(stmt.order_by(PerformanceMetric.metric_date.desc()))
    return result.scalars().all()
