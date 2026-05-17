from database import engine
from sqlalchemy import text

with engine.connect() as conn:
    # Stalls is_open
    try:
        conn.execute(text("ALTER TABLE stalls ADD COLUMN is_open BOOLEAN DEFAULT 1"))
        conn.commit()
        print("✅ Migration done — is_open column added to stalls table.")
    except Exception as e:
        print(f"⚠️  Skipped is_open: {e}")

    # Stalls upi_id
    try:
        conn.execute(text("ALTER TABLE stalls ADD COLUMN upi_id VARCHAR"))
        conn.commit()
        print("✅ Migration done — upi_id column added to stalls table.")
    except Exception as e:
        print(f"⚠️  Skipped upi_id: {e}")

    # Stalls qr_code_url
    try:
        conn.execute(text("ALTER TABLE stalls ADD COLUMN qr_code_url VARCHAR"))
        conn.commit()
        print("✅ Migration done — qr_code_url column added to stalls table.")
    except Exception as e:
        print(f"⚠️  Skipped qr_code_url: {e}")

    # Orders payment_mode
    try:
        conn.execute(text("ALTER TABLE orders ADD COLUMN payment_mode VARCHAR DEFAULT 'counter'"))
        conn.commit()
        print("✅ Migration done — payment_mode column added to orders table.")
    except Exception as e:
        print(f"⚠️  Skipped payment_mode: {e}")

    # Orders payment_status
    try:
        conn.execute(text("ALTER TABLE orders ADD COLUMN payment_status VARCHAR DEFAULT 'pending'"))
        conn.commit()
        print("✅ Migration done — payment_status column added to orders table.")
    except Exception as e:
        print(f"⚠️  Skipped payment_status: {e}")

    # Stalls is_updated
    try:
        conn.execute(text("ALTER TABLE stalls ADD COLUMN is_updated BOOLEAN DEFAULT 0"))
        conn.commit()
        print("✅ Migration done — is_updated column added to stalls table.")
    except Exception as e:
        print(f"⚠️  Skipped is_updated: {e}")