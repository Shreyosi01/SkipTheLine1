from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# ✅ IMPORTANT (Frontend won't work without this)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

orders = []

@app.get("/")
def home():
    return {"message": "Backend running"}

@app.post("/order")
def create_order(item: str):
    order = {
        "id": len(orders) + 1,
        "item": item,
        "status": "waiting"
    }
    orders.append(order)
    return order

@app.get("/orders")
def get_orders():
    return orders

@app.get("/queue")
def get_queue():
    return {"queue_length": len(orders)}