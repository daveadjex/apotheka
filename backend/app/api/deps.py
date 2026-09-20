import uuid
from collections.abc import Callable

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_token
from app.db.session import get_db
from app.models.user import User, UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


class CurrentUser:
    def __init__(self, id: uuid.UUID, tenant_id: uuid.UUID | None, role: UserRole):
        self.id = id
        self.tenant_id = tenant_id
        self.role = role


async def get_current_user(token: str = Depends(oauth2_scheme)) -> CurrentUser:
    try:
        payload = decode_token(token)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    if payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Not an access token")

    return CurrentUser(
        id=uuid.UUID(payload["sub"]),
        tenant_id=uuid.UUID(payload["tenant_id"]) if payload.get("tenant_id") else None,
        role=UserRole(payload["role"]),
    )


async def get_current_active_user(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> User:
    result = await db.execute(select(User).where(User.id == current_user.id))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(status_code=403, detail="Inactive or unknown user")
    return user


def require_roles(*allowed_roles: UserRole) -> Callable:
    async def checker(current_user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if current_user.role not in allowed_roles and current_user.role != UserRole.SUPER_ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{current_user.role.value}' is not permitted to perform this action",
            )
        return current_user

    return checker


def require_same_tenant(resource_tenant_id: uuid.UUID, current_user: CurrentUser) -> None:
    if current_user.role == UserRole.SUPER_ADMIN:
        return
    if current_user.tenant_id != resource_tenant_id:
        raise HTTPException(status_code=404, detail="Resource not found")
