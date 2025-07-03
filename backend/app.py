import os
import json
import asyncio
import re # Import the regular expression module
from fastapi import FastAPI, Depends, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
import models
import httpx

from dotenv import load_dotenv
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = models.SessionLocal()
    try:
        yield db
    finally:
        db.close()

class LeadResponse(BaseModel):
    id: int
    name: str
    company: str
    industry: str
    size: int
    source: str
    created_at: datetime
    quality: Optional[str] = None
    summary: Optional[str] = None
    
    class Config:
        from_attributes = True

class EventRequest(BaseModel):
    userId: str = "anonymous"
    action: str
    metadata: Dict[str, Any]
    timestamp: datetime

@app.get("/api/leads", response_model=List[LeadResponse])
async def get_leads(
    enrich: bool = False,
    industry: Optional[str] = Query(None),
    size_min: Optional[int] = Query(None, alias="sizeMin"),
    size_max: Optional[int] = Query(None, alias="sizeMax"),
    db: Session = Depends(get_db)
):
    query = db.query(models.Lead)
    if industry: query = query.filter(models.Lead.industry == industry)
    if size_min is not None: query = query.filter(models.Lead.size >= size_min)
    if size_max is not None: query = query.filter(models.Lead.size <= size_max)
    
    leads = query.order_by(models.Lead.created_at.desc()).all()

    if enrich:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            for lead in leads:
                lead.summary = "AI enrichment failed: API key not found."
            return leads

        gemini_api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"

        async with httpx.AsyncClient() as client:
            for lead in leads:
                prompt = f"""
                Analyze the following sales lead and provide a JSON object with two keys: "quality" and "summary".
                - The "quality" should be "High", "Medium", or "Low". High-quality leads are in Technology or Finance with over 100 employees. Medium are in Healthcare or Manufacturing with 50-100 employees. All others are Low.
                - The "summary" should be a single, concise sentence describing the company based on its name and industry.
                Lead Data:
                - Company Name: {lead.company}
                - Industry: {lead.industry}
                - Employee Size: {lead.size}
                Respond with only the raw JSON object.
                """
                payload = {"contents": [{"parts": [{"text": prompt}]}]}
                
                try:
                    response = await client.post(gemini_api_url, json=payload, timeout=30.0)
                    
                    if response.status_code == 403:
                        lead.quality = "Error"
                        lead.summary = "Permission Denied. Check API Key."
                        continue 

                    response.raise_for_status() # Raise exceptions for other bad statuses

                    result = response.json()
                    
                    if "candidates" in result and result["candidates"]:
                        content = result["candidates"][0]["content"]["parts"][0]["text"]
                        
                        # More robustly find the JSON block
                        match = re.search(r'\{.*\}', content, re.DOTALL)
                        if match:
                            json_str = match.group(0)
                            llm_data = json.loads(json_str)
                            lead.quality = llm_data.get("quality", "N/A")
                            lead.summary = llm_data.get("summary", "N/A")
                        else:
                            lead.quality = "Error"
                            lead.summary = "No JSON in AI response."
                    else:
                        lead.quality = "Error"
                        lead.summary = "Malformed AI Response."

                except json.JSONDecodeError:
                    lead.quality = "Error"
                    lead.summary = "Failed to decode AI response."
                except httpx.HTTPStatusError as e:
                    lead.quality = "Error"
                    lead.summary = f"API Error: {e.response.status_code}"
                except httpx.RequestError:
                    lead.quality = "Error"
                    lead.summary = "Connection Error."
                except Exception:
                    lead.quality = "Error"
                    lead.summary = "An unexpected error occurred."
                
                await asyncio.sleep(1)
    return leads


@app.post("/api/events")
def track_event(event: EventRequest, db: Session = Depends(get_db)):
    db_event = models.Event(
        user_id=event.userId,
        action=event.action,
        event_data=event.metadata,
        occurred_at=event.timestamp
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return {"status": "success", "eventId": db_event.id}
