from typing import Optional, List
from pydantic import BaseModel, Field


class StyleBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = []
    previewUrl: Optional[str] = None
    exampleUrls: Optional[List[str]] = []
    recommendedKeywords: Optional[List[str]] = []


class StyleCreate(StyleBase):
    srefCode: str


class StyleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    previewUrl: Optional[str] = None
    exampleUrls: Optional[List[str]] = None
    recommendedKeywords: Optional[List[str]] = None


class StyleInDB(StyleBase):
    srefCode: str  # Unique identifier for the style

    class Config:
        orm_mode = True


class Style(StyleInDB):
    pass


class StyleCategory(BaseModel):
    name: str
    description: Optional[str] = None
    count: int = 0
