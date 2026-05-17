from database import engine, Base

# Only create tables, no dummy seeds
Base.metadata.create_all(bind=engine)
print("✅ Database initialized successfully!")