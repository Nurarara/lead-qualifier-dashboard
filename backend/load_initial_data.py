import csv
from sqlalchemy.orm import sessionmaker
from models import engine, Lead
from datetime import datetime
import os

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

csv_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'leads.csv')

with open(csv_path, "r") as f:
    reader = csv.DictReader(f)
    for row in reader:
        exists = db.query(Lead).filter(Lead.id == int(row['id'])).first()
        if not exists:
            db_lead = Lead(
                id=int(row['id']),
                name=row['name'],
                company=row['company'],
                industry=row['industry'],
                size=int(row['size']),
                source=row['source'],
                created_at=datetime.fromisoformat(row['created_at'].replace("Z", ""))
            )
            db.add(db_lead)
    db.commit()

print("✅ Database has been populated with initial lead data.")
db.close()