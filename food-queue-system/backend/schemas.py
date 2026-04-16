from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# ── Auth ──────────────────────────────────────────
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str           # "customer" or "vendor"
    stall_id: Optional[int] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

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

# ── Orders ────────────────────────────────────────
class OrderItemIn(BaseModel):
    menu_item_id: int
    quantity: int

class OrderCreate(BaseModel):
    stall_id: int
    items: List[OrderItemIn]

class OrderStatusUpdate(BaseModel):
    status: str   # "preparing" | "ready" | "completed"

class OrderItemResponse(BaseModel):
    id: int
    menu_item_id: int
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