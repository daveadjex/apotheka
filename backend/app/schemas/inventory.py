import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class DrugOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    ndc_code: str
    generic_name: str
    brand_name: str | None
    dosage_form: str | None
    strength: str | None
    requires_rx: bool


class InventoryItemCreate(BaseModel):
    drug_id: uuid.UUID
    branch_id: uuid.UUID
    supplier_id: uuid.UUID | None = None
    batch_number: str
    quantity_on_hand: int = Field(ge=0)
    reorder_threshold: int = Field(default=10, ge=0)
    reorder_quantity: int = Field(default=50, ge=0)
    unit_cost: float | None = None
    unit_price: float = Field(gt=0)
    expiry_date: date


class InventoryItemAdjust(BaseModel):
    delta: int
    reason: str


class InventoryItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    tenant_id: uuid.UUID
    branch_id: uuid.UUID
    drug: DrugOut
    batch_number: str
    quantity_on_hand: int
    reorder_threshold: int
    reorder_quantity: int
    unit_price: float
    expiry_date: date
    received_at: datetime


class SupplierCreate(BaseModel):
    name: str
    contact_email: str | None = None
    contact_phone: str | None = None
    lead_time_days: int = 3


class SupplierOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    contact_email: str | None
    contact_phone: str | None
    lead_time_days: int
