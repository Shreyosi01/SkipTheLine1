from database import engine
from sqlalchemy import text

with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE stalls ADD COLUMN is_open BOOLEAN DEFAULT 1"))
        conn.commit()
        print("✅ Migration done — is_open column added to stalls table.")
    except Exception as e:
        print(f"⚠️  Skipped (probably already exists): {e}")