from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import random
from database import get_db
from auth import get_current_user
import models, schemas

router = APIRouter(prefix="/orders", tags=["Orders"])

# Mirrors the getNextStatus logic in VendorOrders.tsx exactly.
# A vendor can only move an order forward — never backward or skip a step.
STATUS_FLOW = {
    "placed": "preparing",
    "preparing": "ready",
    "ready": "completed",
}

def generate_token():
    return f"#{random.randint(1000, 9999)}"

def get_queue_number(db: Session, stall_id: int) -> int:
    count = db.query(models.Order).filter(
        models.Order.stall_id == stall_id,
        models.Order.status != "completed"
    ).count()
    return count + 1


@router.post("", response_model=schemas.OrderResponse)
def place_order(data: schemas.OrderCreate, db: Session = Depends(get_db),
                current_user=Depends(get_current_user)):
    if current_user.role != "customer":
        raise HTTPException(status_code=403, detail="Only customers can place orders")

    total = 0
    order_items_data = []

    for item in data.items:
        menu_item = db.query(models.MenuItem).filter(
            models.MenuItem.id == item.menu_item_id
        ).first()
        if not menu_item:
            raise HTTPException(status_code=404, detail=f"Menu item {item.menu_item_id} not found")
        if not menu_item.is_available:
            raise HTTPException(
                status_code=400,
                detail=f"'{menu_item.name}' is currently unavailable"
            )
        total += menu_item.price * item.quantity
        order_items_data.append((item, menu_item))

    order = models.Order(
        token=generate_token(),
        customer_id=current_user.id,
        stall_id=data.stall_id,
        status="placed",
        queue_number=get_queue_number(db, data.stall_id),
        total_price=total
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    for item, menu_item in order_items_data:
        db.add(models.OrderItem(
            order_id=order.id,
            menu_item_id=item.menu_item_id,
            quantity=item.quantity,
            price=menu_item.price,
            menu_item_name=menu_item.name
        ))
    db.commit()
    db.refresh(order)
    return order


# ✅ /my MUST stay above /{order_id} — FastAPI matches top-down
@router.get("/my", response_model=List[schemas.OrderResponse])
def my_orders(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(models.Order).filter(
        models.Order.customer_id == current_user.id
    ).order_by(models.Order.created_at.desc()).all()


@router.get("", response_model=List[schemas.OrderResponse])
def vendor_orders(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role != "vendor":
        raise HTTPException(status_code=403, detail="Vendors only")

    stall = db.query(models.Stall).filter(models.Stall.owner_id == current_user.id).first()
    if not stall:
        raise HTTPException(status_code=404, detail="Vendor must create a stall first")

    return db.query(models.Order).filter(
        models.Order.stall_id == stall.id
    ).order_by(models.Order.created_at.desc()).all()


@router.get("/{order_id}", response_model=schemas.OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db),
              current_user=Depends(get_current_user)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.patch("/{order_id}/status")
def update_status(order_id: int, data: schemas.OrderStatusUpdate,
                  db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role != "vendor":
        raise HTTPException(status_code=403, detail="Vendors only")

    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # ✅ Vendor ownership check — vendor can only update orders for their own stall
    stall = db.query(models.Stall).filter(models.Stall.owner_id == current_user.id).first()
    if not stall or order.stall_id != stall.id:
        raise HTTPException(status_code=403, detail="This order does not belong to your stall")

    # ✅ Forward-only transition enforcement.
    # STATUS_FLOW maps each status to the only valid next status.
    # This mirrors getNextStatus() in VendorOrders.tsx exactly so the backend
    # and frontend always agree on what transitions are legal.
    expected_next = STATUS_FLOW.get(order.status)
    if expected_next is None:
        raise HTTPException(
            status_code=400,
            detail="Order is already completed and cannot be updated further"
        )
    if data.status != expected_next:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid transition: '{order.status}' → '{data.status}'. Expected next status: '{expected_next}'"
        )

    order.status = data.status
    db.commit()
    return {"message": "Status updated", "status": order.status}