from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class MediaBase(BaseModel):
    projectId: str
    type: str  # "image", "video", "audio"
    url: str
    thumbnailUrl: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = {}


class MediaCreate(MediaBase):
    pass


class MediaUpdate(BaseModel):
    url: Optional[str] = None
    thumbnailUrl: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class MediaInDB(MediaBase):
    id: str
    createdAt: datetime

    class Config:
        orm_mode = True


class Media(MediaInDB):
    pass


class MediaUpload(BaseModel):
    projectId: str
    type: str  # "image", "video", "audio"
    file: bytes
    fileName: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = {}


class MediaEdit(BaseModel):
    id: str
    edits: Dict[str, Any]  # Edit operations to be applied


class MediaExport(BaseModel):
    projectId: str
    format: str = "mp4"  # Export format
    quality: str = "high"  # Export quality
    includeWatermark: bool = True
    includeSoundtrack: bool = True
    includeVoiceover: bool = True
    customSettings: Optional[Dict[str, Any]] = {}
