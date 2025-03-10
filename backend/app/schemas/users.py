from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    email: EmailStr
    displayName: Optional[str] = None
    photoURL: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    displayName: Optional[str] = None
    photoURL: Optional[str] = None
    subscription: Optional[str] = None
    credits: Optional[int] = None


class UserInDB(UserBase):
    id: str
    subscription: str = "free"
    credits: int = 100
    createdAt: datetime
    updatedAt: Optional[datetime] = None

    class Config:
        orm_mode = True


class User(UserInDB):
    pass
