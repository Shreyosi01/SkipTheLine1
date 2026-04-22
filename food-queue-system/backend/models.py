from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Stall(Base):
    __tablename__ = "stalls"
    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String)
    category   = Column(String)
    avatar     = Column(String, nullable=True)  # preset avatar choice
    image_url  = Column(String, nullable=True)
    rating     = Column(Float, default=4.0)
    owner_id   = Column(Integer, ForeignKey("users.id"))  # vendor who owns this stall
    owner      = relationship("User", back_populates="stalls")
    menu_items = relationship("MenuItem", back_populates="stall")
    orders     = relationship("Order", back_populates="stall")

class User(Base):
    __tablename__ = "users"
    id       = Column(Integer, primary_key=True, index=True)
    name     = Column(String)
    email    = Column(String, unique=True, index=True)
    password = Column(String)
    phone    = Column(String, nullable=True)  # phone number for vendors
    role     = Column(String)  # "customer" or "vendor"
    stalls   = relationship("Stall", back_populates="owner")  # vendors can own stalls
    orders   = relationship("Order", back_populates="customer")

class MenuItem(Base):
    __tablename__ = "menu_items"
    id           = Column(Integer, primary_key=True, index=True)
    name         = Column(String)
    description  = Column(String, nullable=True)
    price        = Column(Float)
    is_available = Column(Boolean, default=True)
    stall_id     = Column(Integer, ForeignKey("stalls.id"))
    stall        = relationship("Stall", back_populates="menu_items")

class Order(Base):
    __tablename__ = "orders"
    id           = Column(Integer, primary_key=True, index=True)
    token        = Column(String)
    customer_id  = Column(Integer, ForeignKey("users.id"))
    stall_id     = Column(Integer, ForeignKey("stalls.id"))
    status       = Column(String, default="placed")
    queue_number = Column(Integer)
    total_price  = Column(Float)
    created_at   = Column(DateTime, default=datetime.utcnow)
    items        = relationship("OrderItem", back_populates="order")
    customer     = relationship("User", back_populates="orders")
    stall        = relationship("Stall", back_populates="orders")

class OrderItem(Base):
    __tablename__ = "order_items"
    id           = Column(Integer, primary_key=True, index=True)
    order_id     = Column(Integer, ForeignKey("orders.id"))
    menu_item_id = Column(Integer, ForeignKey("menu_items.id"))
    quantity     = Column(Integer)
    price          = Column(Float, default=0.0)        # ← add this
    menu_item_name = Column(String, default="")        # ← add this
    order        = relationship("Order", back_populates="items")