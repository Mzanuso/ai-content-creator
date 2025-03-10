from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class StyleData(BaseModel):
    srefCode: Optional[str] = None
    keywords: Optional[List[str]] = []
    colorPalette: Optional[List[str]] = []


class ScreenplaySection(BaseModel):
    id: str
    text: str
    order: int


class Screenplay(BaseModel):
    concept: Optional[str] = None
    sections: Optional[List[ScreenplaySection]] = []


class StoryboardImage(BaseModel):
    id: str
    sectionId: str
    imageUrl: str
    prompt: Optional[str] = None
    cameraSettings: Optional[Dict[str, Any]] = {}
    order: int


class AudioTrack(BaseModel):
    id: str
    type: str  # "music", "voiceover", "effect"
    url: str
    settings: Optional[Dict[str, Any]] = {}


class Production(BaseModel):
    videoUrl: Optional[str] = None
    audioTracks: Optional[List[AudioTrack]] = []
    exportSettings: Optional[Dict[str, Any]] = {}


class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = ""
    aspectRatio: Optional[str] = "16:9"
    targetDuration: Optional[int] = 30  # in seconds


class ProjectCreate(ProjectBase):
    userId: str


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    aspectRatio: Optional[str] = None
    targetDuration: Optional[int] = None
    styleData: Optional[StyleData] = None
    screenplay: Optional[Screenplay] = None
    storyboard: Optional[List[StoryboardImage]] = None
    production: Optional[Production] = None


class ProjectInDB(ProjectBase):
    id: str
    userId: str
    status: str = "draft"  # "draft", "in-progress", "completed"
    styleData: Optional[StyleData] = None
    screenplay: Optional[Screenplay] = None
    storyboard: Optional[List[StoryboardImage]] = []
    production: Optional[Production] = None
    createdAt: datetime
    updatedAt: Optional[datetime] = None

    class Config:
        orm_mode = True


class Project(ProjectInDB):
    pass
