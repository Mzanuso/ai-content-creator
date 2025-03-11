from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends, status, BackgroundTasks, UploadFile, File
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from app.services.audio_service import audio_service
from app.api.deps import get_current_user

router = APIRouter()

# ---------------------
# Request/Response Models
# ---------------------

class MusicGenerationRequest(BaseModel):
    """Request model for generating background music."""
    duration: int = Field(..., description="Duration in seconds", gt=0, le=600)
    mood: Optional[str] = Field(None, description="Emotional mood (happy, sad, energetic, calm, etc.)")
    tempo: Optional[str] = Field(None, description="Music tempo (slow, medium, fast)")
    genre: Optional[str] = Field(None, description="Music genre/style")
    instruments: Optional[List[str]] = Field(None, description="Preferred instruments")
    
class VoiceoverGenerationRequest(BaseModel):
    """Request model for generating voice-over narration."""
    text: str = Field(..., description="Text to convert to speech")
    voice_id: Optional[str] = Field(None, description="Voice ID to use")
    language: str = Field("en-US", description="Language code")
    speed: float = Field(1.0, description="Speech rate multiplier", ge=0.5, le=2.0)
    pitch: float = Field(0.0, description="Voice pitch adjustment", ge=-1.0, le=1.0)

class SoundEffectGenerationRequest(BaseModel):
    """Request model for generating sound effects."""
    description: str = Field(..., description="Description of the desired sound effect")
    duration: Optional[int] = Field(None, description="Duration constraint in seconds", gt=0, le=30)

class AudioTrackInfo(BaseModel):
    """Model for audio track information in mixing requests."""
    url: str = Field(..., description="URL of the audio file")
    volume: float = Field(1.0, description="Volume level (0.0 to 1.0)", ge=0.0, le=1.0)
    start_time: float = Field(0.0, description="Start time in seconds", ge=0.0)
    fade_in: Optional[float] = Field(None, description="Fade in duration in seconds")
    fade_out: Optional[float] = Field(None, description="Fade out duration in seconds")

class AudioMixRequest(BaseModel):
    """Request model for mixing multiple audio tracks."""
    tracks: List[AudioTrackInfo] = Field(..., description="List of tracks to mix")
    output_format: str = Field("mp3", description="Output audio format")
    
class GenerationResponse(BaseModel):
    """Response model for generation requests."""
    job_id: str = Field(..., description="Job ID for tracking generation progress")
    status: str = Field(..., description="Current job status")
    
class AudioResultResponse(BaseModel):
    """Response model with completed audio generation result."""
    url: str = Field(..., description="URL to the generated audio file")
    duration: float = Field(..., description="Duration in seconds")
    format: str = Field(..., description="Audio format")
    metadata: Dict[str, Any] = Field({}, description="Additional metadata")

# ---------------------
# API Endpoints
# ---------------------

@router.post("/generate/music", response_model=GenerationResponse)
async def generate_music(
    request: MusicGenerationRequest,
    background_tasks: BackgroundTasks,
    current_user = Depends(get_current_user)
):
    """
    Generate background music through the Udio API.
    """
    try:
        response = await audio_service.generate_music(
            duration=request.duration,
            mood=request.mood,
            tempo=request.tempo,
            genre=request.genre,
            instruments=request.instruments
        )
        
        if response.get("status") == "error":
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=response.get("error", "Failed to generate music")
            )
        
        # Start background task to monitor job status if needed
        job_id = response.get("job_id")
        if job_id:
            background_tasks.add_task(audio_service.wait_for_completion, job_id)
        
        return {"job_id": job_id, "status": response.get("status", "processing")}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Music generation failed: {str(e)}"
        )

@router.post("/generate/voiceover", response_model=GenerationResponse)
async def generate_voiceover(
    request: VoiceoverGenerationRequest,
    background_tasks: BackgroundTasks,
    current_user = Depends(get_current_user)
):
    """
    Generate voice-over narration through the Udio API.
    """
    try:
        response = await audio_service.generate_voice(
            text=request.text,
            voice_id=request.voice_id,
            language=request.language,
            speed=request.speed,
            pitch=request.pitch
        )
        
        if response.get("status") == "error":
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=response.get("error", "Failed to generate voiceover")
            )
        
        # Start background task to monitor job status if needed
        job_id = response.get("job_id")
        if job_id:
            background_tasks.add_task(audio_service.wait_for_completion, job_id)
        
        return {"job_id": job_id, "status": response.get("status", "processing")}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Voice generation failed: {str(e)}"
        )

@router.post("/generate/soundeffect", response_model=GenerationResponse)
async def generate_sound_effect(
    request: SoundEffectGenerationRequest,
    background_tasks: BackgroundTasks,
    current_user = Depends(get_current_user)
):
    """
    Generate sound effects through the Udio API.
    """
    try:
        response = await audio_service.generate_sound_effect(
            description=request.description,
            duration=request.duration
        )
        
        if response.get("status") == "error":
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=response.get("error", "Failed to generate sound effect")
            )
        
        # Start background task to monitor job status if needed
        job_id = response.get("job_id")
        if job_id:
            background_tasks.add_task(audio_service.wait_for_completion, job_id)
        
        return {"job_id": job_id, "status": response.get("status", "processing")}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Sound effect generation failed: {str(e)}"
        )

@router.post("/mix", response_model=GenerationResponse)
async def mix_audio_tracks(
    request: AudioMixRequest,
    background_tasks: BackgroundTasks,
    current_user = Depends(get_current_user)
):
    """
    Mix multiple audio tracks with volume and timing adjustments.
    """
    try:
        # Convert request model to the format expected by the service
        tracks = [
            {
                "url": track.url,
                "volume": track.volume,
                "start_time": track.start_time,
                "fade_in": track.fade_in,
                "fade_out": track.fade_out
            }
            for track in request.tracks
        ]
        
        response = await audio_service.mix_audio_tracks(tracks)
        
        if response.get("status") == "error":
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=response.get("error", "Failed to mix audio tracks")
            )
        
        # Start background task to monitor job status if needed
        job_id = response.get("job_id")
        if job_id:
            background_tasks.add_task(audio_service.wait_for_completion, job_id)
        
        return {"job_id": job_id, "status": response.get("status", "processing")}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Audio mixing failed: {str(e)}"
        )

@router.get("/status/{job_id}", response_model=Dict[str, Any])
async def check_generation_status(
    job_id: str,
    current_user = Depends(get_current_user)
):
    """
    Check the status of an audio generation job.
    """
    try:
        response = await audio_service.check_generation_status(job_id)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to check job status: {str(e)}"
        )

@router.post("/upload", response_model=Dict[str, Any])
async def upload_audio_file(
    file: UploadFile = File(...),
    current_user = Depends(get_current_user)
):
    """
    Upload an audio file for processing.
    """
    # This would handle file storage (e.g., to Firebase Storage)
    # Implementation would depend on storage service being used
    
    return {
        "filename": file.filename,
        "status": "uploaded",
        "message": "File upload functionality would be implemented here"
    }
