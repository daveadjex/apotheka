import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, model_validator


class ShiftCreate(BaseModel):
    branch_id: uuid.UUID
    user_id: uuid.UUID
    starts_at: datetime
    ends_at: datetime

    @model_validator(mode="after")
    def ends_after_starts(self) -> "ShiftCreate":
        if self.ends_at <= self.starts_at:
            raise ValueError("ends_at must be after starts_at")
        return self


class ShiftOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    branch_id: uuid.UUID
    user_id: uuid.UUID
    starts_at: datetime
    ends_at: datetime
    is_ai_suggested: bool


class PerformanceMetricOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    user_id: uuid.UUID
    metric_date: date
    prescriptions_filled: int
    avg_checkout_seconds: float | None
    sales_total: float
