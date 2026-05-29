import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Resolve an absolute path for the SQLite database in the project root
BASE_DIR = Path(__file__).resolve().parent.parent
DB_FILE = BASE_DIR / "skiptheline.db"
# Ensure the directory exists and the file is created (SQLite will create it, but we touch it to set permissions)
if not DB_FILE.exists():
    DB_FILE.touch(mode=0o664, exist_ok=True)

# Use an absolute SQLite URL
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_FILE}"



engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}  # needed for SQLite only
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# This function gives each request its own DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()