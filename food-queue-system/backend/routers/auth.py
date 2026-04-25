from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user
import models, schemas, auth as auth_utils
import traceback

router = APIRouter(prefix="/auth", tags=["Auth"])

VALID_ROLES = {"customer", "vendor"}


@router.post("/register", response_model=schemas.TokenResponse)
def register(data: schemas.RegisterRequest, db: Session = Depends(get_db)):
    try:
        # ✅ NEW: Role validation — only "customer" or "vendor" are accepted.
        # The frontend enforces this via the mode toggle, but the backend must
        # never trust client input — a raw API call could send anything.
        if data.role not in VALID_ROLES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid role '{data.role}'. Must be 'customer' or 'vendor'."
            )

        if db.query(models.User).filter(models.User.email == data.email).first():
            raise HTTPException(status_code=400, detail="Email already registered")

        user = models.User(
            name=data.name,
            email=data.email,
            password=auth_utils.hash_password(data.password),
            phone=data.phone,
            role=data.role
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        token = auth_utils.create_token({"sub": str(user.id)})
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "phone": user.phone,
                "role": user.role,
                "avatar": None,
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")


@router.post("/login", response_model=schemas.TokenResponse)
def login(data: schemas.LoginRequest, db: Session = Depends(get_db)):
    try:
        user = db.query(models.User).filter(models.User.email == data.email).first()
        if not user or not auth_utils.verify_password(data.password, user.password):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        token = auth_utils.create_token({"sub": str(user.id)})
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "phone": user.phone,
                "role": user.role,
                "avatar": None,
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")


# ✅ NEW: GET /auth/me
# Used by AppContext on page reload to verify the stored token is still valid
# and re-hydrate the user object from the DB instead of trusting localStorage.
# Also used by Profile.tsx to show current server-side user state.
@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user=Depends(get_current_user)):
    return current_user


# ✅ NEW: PUT /auth/me
# Profile.tsx edits name/email/phone/avatar locally only — changes are lost on
# refresh because there was no backend call. This endpoint persists them.
@router.put("/me", response_model=schemas.UserResponse)
def update_me(data: schemas.UpdateProfileRequest, db: Session = Depends(get_db),
              current_user=Depends(get_current_user)):
    # Check if new email is already taken by someone else
    if data.email and data.email != current_user.email:
        existing = db.query(models.User).filter(models.User.email == data.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")

    if data.name is not None:
        current_user.name = data.name
    if data.email is not None:
        current_user.email = data.email
    if data.phone is not None:
        current_user.phone = data.phone

    db.commit()
    db.refresh(current_user)
    return current_user


# ✅ NEW: DELETE /auth/delete
# client.ts already calls DELETE /auth/delete from Profile.tsx's delete button.
# Without this endpoint, account deletion silently fails with a 404 and the
# frontend clears the session anyway — leaving orphaned data in the DB.
@router.delete("/delete")
def delete_account(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    try:
        # Delete all order items for orders belonging to this user
        user_orders = db.query(models.Order).filter(
            models.Order.customer_id == current_user.id
        ).all()
        for order in user_orders:
            db.query(models.OrderItem).filter(
                models.OrderItem.order_id == order.id
            ).delete()
        db.query(models.Order).filter(
            models.Order.customer_id == current_user.id
        ).delete()

        # If vendor: delete their menu items and stall too
        stall = db.query(models.Stall).filter(
            models.Stall.owner_id == current_user.id
        ).first()
        if stall:
            stall_orders = db.query(models.Order).filter(
                models.Order.stall_id == stall.id
            ).all()
            for order in stall_orders:
                db.query(models.OrderItem).filter(
                    models.OrderItem.order_id == order.id
                ).delete()
            db.query(models.Order).filter(
                models.Order.stall_id == stall.id
            ).delete()
            db.query(models.MenuItem).filter(
                models.MenuItem.stall_id == stall.id
            ).delete()
            db.delete(stall)

        db.delete(current_user)
        db.commit()
        return {"message": "Account deleted successfully"}
    except Exception as e:
        db.rollback()
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to delete account: {str(e)}")