from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user
import models

router = APIRouter(prefix="/queue", tags=["Queue"])

@router.get("/{stall_id}")
def get_queue(stall_id: int, db: Session = Depends(get_db)):
    active_orders = db.query(models.Order).filter(
        models.Order.stall_id == stall_id,
        models.Order.status != "completed"
    ).order_by(models.Order.queue_number).all()

    return {
        "stall_id": stall_id,
        "queue_length": len(active_orders),
        "estimated_wait_minutes": len(active_orders) * 5,
        "orders": [
            {"queue_number": o.queue_number, "token": o.token, "status": o.status}
            for o in active_orders
        ]
    }

@router.get("/position/{order_id}")
def get_queue_position(order_id: int, db: Session = Depends(get_db),
                       current_user=Depends(get_current_user)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    ahead = db.query(models.Order).filter(
        models.Order.stall_id == order.stall_id,
        models.Order.queue_number < order.queue_number,
        models.Order.status != "completed"
    ).count()
    return {
        "queue_position": ahead + 1,
        "orders_ahead": ahead,
        "estimated_wait_minutes": ahead * 5
    }