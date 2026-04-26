from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime

# ── Auth ──────────────────────────────────────────
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    phone: Optional[str] = None
    role: str

class LoginRequest(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    role: str
    avatar: Optional[str] = None

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None


# ── Stall ─────────────────────────────────────────
class StallCreate(BaseModel):
    name: str
    category: str
    avatar: Optional[str] = None

class StallResponse(BaseModel):
    id: int
    name: str
    category: str
    avatar: Optional[str]
    image_url: Optional[str]
    rating: float
    owner_id: int

    class Config:
        from_attributes = True


# ── Menu ──────────────────────────────────────────
class MenuItemCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    is_available: bool = True

class MenuItemResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    price: float
    is_available: bool
    stall_id: int

    class Config:
        from_attributes = True

# ✅ NEW: Used by PATCH /menu/{item_id}/availability
# Single-field update — vendor sends just { "is_available": false }
# without re-sending name/price/description.
class AvailabilityUpdate(BaseModel):
    is_available: bool


# ── Orders ────────────────────────────────────────
class OrderItemIn(BaseModel):
    menu_item_id: int
    quantity: int

class OrderCreate(BaseModel):
    stall_id: int
    items: List[OrderItemIn]

ALLOWED_STATUSES = {"placed", "preparing", "ready", "completed"}

class OrderStatusUpdate(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def status_must_be_valid(cls, v: str) -> str:
        if v not in ALLOWED_STATUSES:
            raise ValueError(
                f"Invalid status '{v}'. Must be one of: {', '.join(sorted(ALLOWED_STATUSES))}"
            )
        return v

class OrderItemResponse(BaseModel):
    id: int
    menu_item_id: int
    menu_item_name: str = ""
    price: float = 0.0
    quantity: int

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: int
    token: str
    status: str
    queue_number: int
    total_price: float
    stall_id: int
    created_at: datetime
    items: List[OrderItemResponse]

    class Config:
        from_attributes = True