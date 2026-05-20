from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from .database import Base

# SQLAlchemy Models
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

class PredictionHistory(Base):
    __tablename__ = "prediction_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    input_type = Column(String) # 'ndvi' or 'image'
    prediction = Column(String)
    confidence = Column(Float)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

# Pydantic Schemas
class UserCreate(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class NDVIPredictRequest(BaseModel):
    ndvi_values: List[float] # Expect 6 values

class PredictionResponse(BaseModel):
    crop_type: str
    confidence: float
    probabilities: dict

class HistoryResponse(BaseModel):
    id: int
    input_type: str
    prediction: str
    confidence: float
    timestamp: datetime

    class Config:
        from_attributes = True
