from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import random
from database import get_db
from auth import get_current_user
import models, schemas

router = APIRouter(prefix="/orders", tags=["Orders"])

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
    
    # Calculate total
    total = 0
    for item in data.items:
        menu_item = db.query(models.MenuItem).filter(models.MenuItem.id == item.menu_item_id).first()
        if not menu_item:
            raise HTTPException(status_code=404, detail=f"Menu item {item.menu_item_id} not found")
        total += menu_item.price * item.quantity

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

    for item in data.items:
        menu_item = db.query(models.MenuItem).filter(
            models.MenuItem.id == item.menu_item_id).first()
        db.add(models.OrderItem(
            order_id=order.id,
            menu_item_id=item.menu_item_id,
            quantity=item.quantity,
            price=menu_item.price,          # store price snapshot
            menu_item_name=menu_item.name   # store name snapshot
        ))
    db.commit()
    db.refresh(order)
    return order

@router.get("/my", response_model=List[schemas.OrderResponse])
def my_orders(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(models.Order).filter(
        models.Order.customer_id == current_user.id
    ).order_by(models.Order.created_at.desc()).all()

@router.get("/{order_id}", response_model=schemas.OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db),
              current_user=Depends(get_current_user)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.get("", response_model=List[schemas.OrderResponse])
def vendor_orders(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role != "vendor":
        raise HTTPException(status_code=403, detail="Vendors only")
    return db.query(models.Order).filter(
        models.Order.stall_id == current_user.stall_id
    ).order_by(models.Order.created_at.desc()).all()

@router.patch("/{order_id}/status")
def update_status(order_id: int, data: schemas.OrderStatusUpdate,
                  db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role != "vendor":
        raise HTTPException(status_code=403, detail="Vendors only")
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = data.status
    db.commit()
    return {"message": "Status updated", "status": order.status}