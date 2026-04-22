stalls.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from auth import get_current_user
import models, schemas

router = APIRouter(prefix="/stalls", tags=["Stalls"])

@router.post("", response_model=schemas.StallResponse)
def create_stall(data: schemas.StallCreate, db: Session = Depends(get_db),
                 current_user=Depends(get_current_user)):
    """Vendor creates their stall after registration"""
    if current_user.role != "vendor":
        raise HTTPException(status_code=403, detail="Only vendors can create stalls")
    
    # Check if vendor already has a stall
    existing_stall = db.query(models.Stall).filter(models.Stall.owner_id == current_user.id).first()
    if existing_stall:
        raise HTTPException(status_code=400, detail="Vendor can only have one stall")
    
    stall = models.Stall(
        name=data.name,
        category=data.category,
        avatar=data.avatar,
        owner_id=current_user.id
    )
    db.add(stall)
    db.commit()
    db.refresh(stall)
    return stall

@router.get("/vendor/me", response_model=schemas.StallResponse)
def get_my_stall(db: Session = Depends(get_db), 
                 current_user=Depends(get_current_user)):
    """Get the current vendor's stall"""
    if current_user.role != "vendor":
        raise HTTPException(status_code=403, detail="Only vendors can access this endpoint")
    
    stall = db.query(models.Stall).filter(models.Stall.owner_id == current_user.id).first()
    if not stall:
        raise HTTPException(status_code=404, detail="Stall not found")
    return stall

@router.get("/{stall_id}", response_model=schemas.StallResponse)
def get_stall(stall_id: int, db: Session = Depends(get_db)):
    """Get stall details by ID"""
    stall = db.query(models.Stall).filter(models.Stall.id == stall_id).first()
    if not stall:
        raise HTTPException(status_code=404, detail="Stall not found")
    return stall

@router.get("", response_model=List[schemas.StallResponse])
def list_all_stalls(db: Session = Depends(get_db)):
    """List all stalls"""
    return db.query(models.Stall).all()

@router.put("/{stall_id}", response_model=schemas.StallResponse)
def update_stall(stall_id: int, data: schemas.StallCreate,
                 db: Session = Depends(get_db), 
                 current_user=Depends(get_current_user)):
    """Update stall (vendor can only update their own)"""
    stall = db.query(models.Stall).filter(models.Stall.id == stall_id).first()
    if not stall:
        raise HTTPException(status_code=404, detail="Stall not found")
    
    if stall.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only update your own stall")
    
    stall.name = data.name
    stall.category = data.category
    stall.avatar = data.avatar
    db.commit()
    db.refresh(stall)
    return stall