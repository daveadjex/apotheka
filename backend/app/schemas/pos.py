import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator


class SaleItemInput(BaseModel):
    inventory_item_id: uuid.UUID
    quantity: int = Field(gt=0)
    prescription_id: uuid.UUID | None = None


class CheckoutRequest(BaseModel):
    branch_id: uuid.UUID
    patient_id: uuid.UUID | None = None
    items: list[SaleItemInput]
    payment_method: str = "cash"
    insurance_covered: float = 0
    tax: float = 0
    idempotency_key: str

    @model_validator(mode="after")
    def items_not_empty(self) -> "CheckoutRequest":
        if not self.items:
            raise ValueError("Sale must include at least one item")
        return self


class SaleItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    inventory_item_id: uuid.UUID
    quantity: int
    unit_price: float
    line_total: float


class SaleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    branch_id: uuid.UUID
    cashier_id: uuid.UUID
    patient_id: uuid.UUID | None
    subtotal: float
    insurance_covered: float
    patient_copay: float
    tax: float
    total: float
    payment_method: str
    created_at: datetime
    items: list[SaleItemOut]


class BarcodeLookupResult(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    inventory_item_id: uuid.UUID
    generic_name: str
    brand_name: str | None
    unit_price: float
    quantity_on_hand: int
    requires_rx: bool
