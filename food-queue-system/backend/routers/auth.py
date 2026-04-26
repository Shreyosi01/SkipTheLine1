from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user
import models, schemas, auth as auth_utils
import traceback

router = APIRouter(prefix="/auth", tags=["Auth"])

VALID_ROLES = {"customer", "vendor"}


def build_user_response(user: models.User, db: Session = None) -> dict:
    """
    Single source of truth for the user payload returned by every auth endpoint.

    Merge note:
    - Teammate A: resolved stall_id by querying Stall table (good — User has no stall_id col)
    - Teammate B: used user.stalls[0] relationship (also valid, but triggers lazy-load issues)
    - My version: returned stall_id only from login response, not register
    - MERGED: use explicit DB query (safest — avoids lazy-load + works in all contexts).
      If db is not passed (e.g. called from get_me), stall lookup is skipped gracefully.
    """
    stall_id = None
    avatar = None
    if db and user.role == "vendor":
        stall = db.query(models.Stall).filter(models.Stall.owner_id == user.id).first()
        if stall:
            stall_id = stall.id
            avatar = stall.avatar

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "role": user.role,
        "stall_id": stall_id,   # ✅ critical for vendor redirect after login
        "avatar": avatar,
    }


@router.post("/register", response_model=schemas.TokenResponse)
def register(data: schemas.RegisterRequest, db: Session = Depends(get_db)):
    try:
        # ✅ MY ADDITION: role validation — rejects anything outside the two valid roles
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
            "user": build_user_response(user, db)
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
            "user": build_user_response(user, db)  # ✅ includes stall_id + avatar
        }
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

# Used by AppContext.restoreSession to verify token on page reload.
# Uses build_user_response so the shape is identical to login/register.
@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user),
           db: Session = Depends(get_db)):
    return build_user_response(current_user, db)


@router.put("/me", response_model=schemas.UserResponse)
def update_me(data: schemas.UpdateProfileRequest,
              db: Session = Depends(get_db),
              current_user: models.User = Depends(get_current_user)):
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
    return build_user_response(current_user, db)


# ✅ MERGED: DELETE /auth/delete
#   synchronize_session=False which is safer for bulk deletes) + my get_current_user
#   dependency (cleaner than re-decoding the JWT manually inside the handler)
@router.delete("/delete", status_code=200)
def delete_account(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        if current_user.role == "vendor":
            stalls = db.query(models.Stall).filter(
                models.Stall.owner_id == current_user.id
            ).all()
            for stall in stalls:
                stall_orders = db.query(models.Order).filter(
                    models.Order.stall_id == stall.id
                ).all()
                for order in stall_orders:
                    db.query(models.OrderItem).filter(
                        models.OrderItem.order_id == order.id
                    ).delete(synchronize_session=False)
                db.query(models.Order).filter(
                    models.Order.stall_id == stall.id
                ).delete(synchronize_session=False)
                db.query(models.MenuItem).filter(
                    models.MenuItem.stall_id == stall.id
                ).delete(synchronize_session=False)
                db.delete(stall)
        else:
            customer_orders = db.query(models.Order).filter(
                models.Order.customer_id == current_user.id
            ).all()
            for order in customer_orders:
                db.query(models.OrderItem).filter(
                    models.OrderItem.order_id == order.id
                ).delete(synchronize_session=False)
            db.query(models.Order).filter(
                models.Order.customer_id == current_user.id
            ).delete(synchronize_session=False)

        db.delete(current_user)
        db.commit()
        return {"message": "Account deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Account deletion failed: {str(e)}")