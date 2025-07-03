import csv
from faker import Faker
import random
from datetime import datetime, timedelta
import os

# Ensure the data directory exists
if not os.path.exists('data'):
    os.makedirs('data')

fake = Faker()
industries = ["Technology", "Manufacturing", "Healthcare", "Finance", "Retail", "Social"]
sources = ["Organic", "PPC", "Referral", "Email", "Social"]

# Generate a CSV file with 50 leads
number_of_leads = 50

with open("data/leads.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["id", "name", "company", "industry", "size", "source", "created_at"])
    for i in range(1, number_of_leads + 1):
        created = datetime.utcnow() - timedelta(days=random.randint(0, 90), hours=random.randint(0, 23))
        writer.writerow([
            i,
            fake.name(),
            fake.company(),
            random.choice(industries),
            random.randint(5, 1000), # Increased max size for more variety
            random.choice(sources),
            created.isoformat() + "Z",
        ])

print(f"✅ data/leads.csv generated successfully with {number_of_leads} leads.")
