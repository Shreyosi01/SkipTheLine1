from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from database import Base, engine
import models
import os
from routers import auth, menu, orders, queue, stalls

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SkipTheLine",
    swagger_ui_parameters={"persistAuthorization": True},
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://skipthelinefrontend.netlify.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(stalls.router)
app.include_router(menu.router)
app.include_router(orders.router)
app.include_router(queue.router)


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


# ✅ DEBUG ROUTES — gated behind ENVIRONMENT env var.
#
# These endpoints return raw DB contents (user emails, phones, all orders)
# with zero authentication. Safe locally, a data leak in production.
#
# To disable on Render:
#   Dashboard → your service → Environment → add variable:
#     ENVIRONMENT = production
#
# Locally: don't set it (or set ENVIRONMENT=development) and they stay available.
IS_PRODUCTION = os.getenv("ENVIRONMENT", "development") == "production"

if not IS_PRODUCTION:
    from database import SessionLocal

    @app.get("/debug/users", tags=["Debug"])
    def view_users():
        try:
            db = SessionLocal()
            users = db.query(models.User).all()
            result = [
                {"id": u.id, "name": u.name, "email": u.email,
                 "phone": getattr(u, "phone", None), "role": u.role}
                for u in users
            ]
            db.close()
            return result
        except Exception as e:
            return {"error": str(e)}

    @app.get("/debug/stalls", tags=["Debug"])
    def view_stalls():
        try:
            db = SessionLocal()
            stalls_list = db.query(models.Stall).all()
            result = [
                {"id": s.id, "name": s.name, "category": s.category,
                 "owner_id": s.owner_id, "avatar": getattr(s, "avatar", None)}
                for s in stalls_list
            ]
            db.close()
            return result
        except Exception as e:
            return {"error": str(e)}

    @app.get("/debug/menu-items", tags=["Debug"])
    def view_menu_items():
        try:
            db = SessionLocal()
            items = db.query(models.MenuItem).all()
            result = [
                {"id": i.id, "name": i.name, "price": i.price,
                 "stall_id": i.stall_id, "available": i.is_available}
                for i in items
            ]
            db.close()
            return result
        except Exception as e:
            return {"error": str(e)}

    @app.get("/debug/orders", tags=["Debug"])
    def view_orders():
        try:
            db = SessionLocal()
            orders_list = db.query(models.Order).all()
            result = [
                {"id": o.id, "token": o.token, "status": o.status,
                 "customer_id": o.customer_id, "stall_id": o.stall_id}
                for o in orders_list
            ]
            db.close()
            return result
        except Exception as e:
            return {"error": str(e)}