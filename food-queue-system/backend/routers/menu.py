from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from auth import get_current_user
import models, schemas

router = APIRouter(prefix="/menu", tags=["Menu"])


@router.get("/{stall_id}", response_model=List[schemas.MenuItemResponse])
def get_menu(stall_id: int, db: Session = Depends(get_db)):
    return db.query(models.MenuItem).filter(models.MenuItem.stall_id == stall_id).all()


@router.post("", response_model=schemas.MenuItemResponse)
def add_menu_item(data: schemas.MenuItemCreate, db: Session = Depends(get_db),
                  current_user=Depends(get_current_user)):
    if current_user.role != "vendor":
        raise HTTPException(status_code=403, detail="Only vendors can add menu items")

    stall = db.query(models.Stall).filter(models.Stall.owner_id == current_user.id).first()
    if not stall:
        raise HTTPException(status_code=403, detail="Vendor must create a stall first")

    item = models.MenuItem(**data.dict(), stall_id=stall.id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/{item_id}", response_model=schemas.MenuItemResponse)
def update_menu_item(item_id: int, data: schemas.MenuItemCreate,
                     db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    item = db.query(models.MenuItem).filter(models.MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    stall = db.query(models.Stall).filter(models.Stall.owner_id == current_user.id).first()
    if not stall or item.stall_id != stall.id:
        raise HTTPException(status_code=403, detail="You can only edit items from your own stall")

    for key, value in data.dict().items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return item


# ✅ NEW: PATCH /menu/{item_id}/availability
# Lets a vendor mark an item sold out or back in stock with a single boolean.
# PUT requires sending the full item body just to flip one field — this is cleaner.
# The backend already blocks orders containing unavailable items, so vendors
# need a fast way to trigger that protection mid-service.
@router.patch("/{item_id}/availability", response_model=schemas.MenuItemResponse)
def toggle_availability(item_id: int, data: schemas.AvailabilityUpdate,
                        db: Session = Depends(get_db),
                        current_user=Depends(get_current_user)):
    if current_user.role != "vendor":
        raise HTTPException(status_code=403, detail="Only vendors can update availability")

    item = db.query(models.MenuItem).filter(models.MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    stall = db.query(models.Stall).filter(models.Stall.owner_id == current_user.id).first()
    if not stall or item.stall_id != stall.id:
        raise HTTPException(status_code=403, detail="You can only update items from your own stall")

    item.is_available = data.is_available
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}")
def delete_menu_item(item_id: int, db: Session = Depends(get_db),
                     current_user=Depends(get_current_user)):
    item = db.query(models.MenuItem).filter(models.MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    stall = db.query(models.Stall).filter(models.Stall.owner_id == current_user.id).first()
    if not stall or item.stall_id != stall.id:
        raise HTTPException(status_code=403, detail="You can only delete items from your own stall")

    db.delete(item)
    db.commit()
    return {"message": "Item deleted"}