import asyncio
import json
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from database import get_db, SessionLocal
from auth import get_current_user
import models

router = APIRouter(prefix="/queue", tags=["Queue"])


def _get_queue_data(db: Session, stall_id: int) -> dict:
    """Shared by REST snapshot and SSE stream — single source of truth."""
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


@router.get("/{stall_id}")
def get_queue(stall_id: int, db: Session = Depends(get_db)):
    """REST snapshot — initial load and polling fallback."""
    return _get_queue_data(db, stall_id)


# ✅ NEW: SSE endpoint — GET /queue/{stall_id}/stream
#
# Why SSE over WebSockets:
#   - One-directional (server → client) which is all we need
#   - Works over plain HTTP, no upgrade handshake — Render-friendly
#   - Browser EventSource auto-reconnects on disconnect
#   - Zero extra libraries needed on the frontend
#
# Render free tier: instances sleep after inactivity, dropping SSE.
# The frontend useQueueStream hook handles this by falling back to
# polling GET /queue/{stall_id} every 5 seconds automatically.
@router.get("/{stall_id}/stream")
async def stream_queue(stall_id: int):
    async def event_generator():
        yield "event: ping\ndata: connected\n\n"
        while True:
            # Fresh session per tick — SSE runs outside request/response lifecycle
            db = SessionLocal()
            try:
                data = _get_queue_data(db, stall_id)
                yield f"data: {json.dumps(data)}\n\n"
            except Exception as e:
                yield f"event: error\ndata: {json.dumps({'error': str(e)})}\n\n"
            finally:
                db.close()
            # 4s interval — fresh enough to feel live, light on DB on free tier
            await asyncio.sleep(4)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",  # prevents Nginx/Render buffering SSE
            "Access-Control-Allow-Origin": "*",
        }
    )


@router.get("/position/{order_id}")
def get_queue_position(order_id: int, db: Session = Depends(get_db),
                       current_user=Depends(get_current_user)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    ahead = db.query(models.Order).filter(
        models.Order.stall_id == order.stall_id,
        models.Order.queue_number < order.queue_number,
        models.Order.status != "completed"
    ).count()

    return {
        "order_id": order_id,
        "stall_id": order.stall_id,
        "queue_position": ahead + 1,
        "orders_ahead": ahead,
        "estimated_wait_minutes": ahead * 5
    }