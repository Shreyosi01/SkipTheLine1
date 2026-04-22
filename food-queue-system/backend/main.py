from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from database import Base, engine
import models
from routers import auth, menu, orders, queue, stalls

# Create all DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SkipTheLine",
    swagger_ui_parameters={"persistAuthorization": True},
)

# ⚠️ CORS — allows your React frontend to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://skipthelinefrontend.netlify.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(stalls.router)
app.include_router(menu.router)
app.include_router(orders.router)
app.include_router(queue.router)

# ── Custom OpenAPI schema — adds simple Bearer token input to Swagger ──
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    schema = get_openapi(
        title=app.title,
        version="1.0.0",
        routes=app.routes,
    )
    schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
    }
    for path in schema["paths"].values():
        for method in path.values():
            method["security"] = [{"BearerAuth": []}]
    app.openapi_schema = schema
    return schema

app.openapi = custom_openapi

@app.get("/")
def root():
    return {"message": "SkipTheLine API is running 🍔"}

# ── Database Viewer (for development) ──────────────────
from database import SessionLocal

@app.get("/debug/users")
def view_users():
    """View all users in database"""
    try:
        db = SessionLocal()
        users = db.query(models.User).all()
        result = []
        for u in users:
            result.append({
                "id": u.id,
                "name": u.name,
                "email": u.email,
                "phone": getattr(u, 'phone', None),
                "role": u.role
            })
        db.close()
        return result
    except Exception as e:
        return {"error": str(e)}

@app.get("/debug/stalls")
def view_stalls():
    """View all stalls in database"""
    try:
        db = SessionLocal()
        stalls = db.query(models.Stall).all()
        result = []
        for s in stalls:
            result.append({
                "id": s.id,
                "name": s.name,
                "category": s.category,
                "owner_id": s.owner_id,
                "avatar": getattr(s, 'avatar', None)
            })
        db.close()
        return result
    except Exception as e:
        return {"error": str(e)}

@app.get("/debug/menu-items")
def view_menu_items():
    """View all menu items in database"""
    try:
        db = SessionLocal()
        items = db.query(models.MenuItem).all()
        result = []
        for i in items:
            result.append({
                "id": i.id,
                "name": i.name,
                "price": i.price,
                "stall_id": i.stall_id,
                "available": i.is_available
            })
        db.close()
        return result
    except Exception as e:
        return {"error": str(e)}

@app.get("/debug/orders")
def view_orders():
    """View all orders in database"""
    try:
        db = SessionLocal()
        orders = db.query(models.Order).all()
        result = []
        for o in orders:
            result.append({
                "id": o.id,
                "token": o.token,
                "status": o.status,
                "customer_id": o.customer_id,
                "stall_id": o.stall_id
            })
        db.close()
        return result
    except Exception as e:
        return {"error": str(e)}