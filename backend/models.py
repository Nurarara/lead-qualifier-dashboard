import sqlalchemy
from sqlalchemy import create_engine, Column, Integer, String, DateTime, JSON
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime

DATABASE_URL = "sqlite:///./leads.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Lead(Base):
    __tablename__ = "leads"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    company = Column(String)
    industry = Column(String)
    size = Column(Integer)
    source = Column(String)
    created_at = Column(DateTime)

class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, default="anonymous")
    action = Column(String, index=True)
    event_data = Column(JSON)  # <-- Renamed from 'metadata'
    occurred_at = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)