import uuid

from pydantic import BaseModel, ConfigDict, EmailStr

from app.models.user import UserRole


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    tenant_id: uuid.UUID | None = None
    role: UserRole = UserRole.CASHIER


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    tenant_id: uuid.UUID | None
    email: EmailStr
    full_name: str
    role: UserRole
    is_active: bool
