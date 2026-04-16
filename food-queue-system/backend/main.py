from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
import models
from routers import auth, menu, orders, queue

# Create all DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Canteen Queue API")

# ⚠️ CORS — allows your React frontend to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # your Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(menu.router)
app.include_router(orders.router)
app.include_router(queue.router)

@app.get("/")
def root():
    return {"message": "Canteen API is running 🍔"}