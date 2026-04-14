from fastapi import FastAPI

app = FastAPI()

orders = []

@app.get("/")
def home():
    return {"message": "Backend running"}

@app.post("/order")
def create_order(item: str):
    order = {
        "id": len(orders)+1,
        "item": item,
        "status": "waiting"
    }
    orders.append(order)
    return order

@app.get("/orders")
def get_orders():
    return orders