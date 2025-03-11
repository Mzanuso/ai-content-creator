from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends, status, BackgroundTasks, Path, Query
from pydantic import BaseModel, Field, AnyHttpUrl
from datetime import datetime

from app.services.export_service import export_service
from app.api.deps import get_current_user

router = APIRouter()

# ---------------------
# Request/Response Models
# ---------------------

class ExportVideoRequest(BaseModel):
    """Request model for video export"""
    project_id: str = Field(..., description="ID of the project")
    video_url: AnyHttpUrl = Field(..., description="URL of the video to export")
    audio_url: Optional[AnyHttpUrl] = Field(None, description="URL of the audio track")
    format: str = Field("mp4", description="Output format (mp4, webm, mov, gif)")
    quality: str = Field("high", description="Video quality (low, medium, high, ultra)")
    resolution: str = Field("1080p", description="Output resolution (480p, 720p, 1080p, 4k)")
    fps: int = Field(30, description="Frames per second", ge=15, le=60)
    include_audio: bool = Field(True, description="Whether to include audio")
    compress_file: bool = Field(True, description="Whether to compress the output file")
    add_watermark: bool = Field(False, description="Whether to add a watermark")
    optimize_for_web: bool = Field(True, description="Whether to optimize for web sharing")

class ShareVideoRequest(BaseModel):
    """Request model for video sharing"""
    project_id: str = Field(..., description="ID of the project")
    export_url: AnyHttpUrl = Field(..., description="URL of the exported video")
    platform: str = Field(..., description="Social platform to share to")
    title: str = Field(..., description="Title of the video")
    description: str = Field(..., description="Description of the video")
    tags: List[str] = Field([], description="List of tags for the video")
    visibility: str = Field("unlisted", description="Visibility setting (public, unlisted, private)")

class ExportResponse(BaseModel):
    """Response model for export request"""
    job_id: str = Field(..., description="Unique ID for the export job")
    status: str = Field(..., description="Status of the export job")
    timestamp: str = Field(..., description="Timestamp of the request")

class ShareResponse(BaseModel):
    """Response model for share request"""
    status: str = Field(..., description="Status of the share request")
    platform: str = Field(..., description="Platform the video was shared to")
    url: Optional[str] = Field(None, description="Share URL")
    share_id: Optional[str] = Field(None, description="Unique ID for the share")
    timestamp: str = Field(..., description="Timestamp of the request")

class ExportDetailsResponse(BaseModel):
    """Response model for export details"""
    job_id: str = Field(..., description="Unique ID for the export job")
    project_id: str = Field(..., description="ID of the project")
    user_id: str = Field(..., description="ID of the user")
    status: str = Field(..., description="Status of the export job")
    config: Dict[str, Any] = Field(..., description="Export configuration")
    created_at: str = Field(..., description="Creation timestamp")
    updated_at: str = Field(..., description="Last update timestamp")
    result: Optional[Dict[str, Any]] = Field(None, description="Export result data")
    completed_at: Optional[str] = Field(None, description="Completion timestamp")

class ExportListResponse(BaseModel):
    """Response model for list of exports"""
    exports: List[ExportDetailsResponse] = Field(..., description="List of exports")
    count: int = Field(..., description="Total number of exports")

# ---------------------
# API Endpoints
# ---------------------

@router.post("/video", response_model=ExportResponse)
async def export_video(
    request: ExportVideoRequest,
    background_tasks: BackgroundTasks,
    current_user = Depends(get_current_user)
):
    """
    Export a video with specified settings
    """
    try:
        response = await export_service.export_video(
            project_id=request.project_id,
            user_id=current_user.id,
            video_url=str(request.video_url),
            audio_url=str(request.audio_url) if request.audio_url else None,
            format=request.format,
            quality=request.quality,
            resolution=request.resolution,
            fps=request.fps,
            include_audio=request.include_audio,
            compress_file=request.compress_file,
            add_watermark=request.add_watermark,
            optimize_for_web=request.optimize_for_web
        )
        
        if response.get("status") == "error":
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=response.get("error", "Failed to export video")
            )
        
        # Start background task to monitor job status
        job_id = response.get("job_id")
        if job_id:
            background_tasks.add_task(export_service.check_export_status, job_id)
        
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Video export failed: {str(e)}"
        )

@router.post("/share", response_model=ShareResponse)
async def share_video(
    request: ShareVideoRequest,
    current_user = Depends(get_current_user)
):
    """
    Share a video to a social media platform
    """
    try:
        response = await export_service.share_video(
            user_id=current_user.id,
            project_id=request.project_id,
            export_url=str(request.export_url),
            platform=request.platform,
            title=request.title,
            description=request.description,
            tags=request.tags,
            visibility=request.visibility
        )
        
        if response.get("status") == "error":
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=response.get("error", "Failed to share video")
            )
        
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Video sharing failed: {str(e)}"
        )

@router.get("/status/{job_id}", response_model=Dict[str, Any])
async def check_export_status(
    job_id: str = Path(..., description="ID of the export job"),
    current_user = Depends(get_current_user)
):
    """
    Check the status of an export job
    """
    try:
        response = await export_service.check_export_status(job_id)
        
        if response.get("status") == "error":
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=response.get("error", "Failed to check export status")
            )
        
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Status check failed: {str(e)}"
        )

@router.get("/user", response_model=ExportListResponse)
async def get_user_exports(
    limit: int = Query(10, ge=1, le=100, description="Maximum number of exports to return"),
    current_user = Depends(get_current_user)
):
    """
    Get a list of exports for the current user
    """
    try:
        exports = await export_service.get_user_exports(
            user_id=current_user.id,
            limit=limit
        )
        
        return {
            "exports": exports,
            "count": len(exports)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user exports: {str(e)}"
        )

@router.get("/{export_id}", response_model=ExportDetailsResponse)
async def get_export_details(
    export_id: str = Path(..., description="ID of the export"),
    current_user = Depends(get_current_user)
):
    """
    Get details of a specific export
    """
    try:
        export_details = await export_service.get_export_details(
            user_id=current_user.id,
            export_id=export_id
        )
        
        if not export_details:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Export with ID {export_id} not found"
            )
        
        return export_details
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get export details: {str(e)}"
        )

@router.get("/signed-url/{cloud_path:path}", response_model=Dict[str, str])
async def generate_signed_url(
    cloud_path: str = Path(..., description="Path of the file in cloud storage"),
    expires_in: int = Query(3600, ge=60, le=86400, description="Seconds until URL expiration"),
    current_user = Depends(get_current_user)
):
    """
    Generate a signed URL for accessing a file
    """
    try:
        # Security check: Only allow access to user's own files
        if not cloud_path.startswith(f"exports/{current_user.id}/"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this resource"
            )
        
        url = await export_service.generate_signed_url(
            cloud_path=cloud_path,
            expires_in=expires_in
        )
        
        if not url:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"File not found or URL generation failed"
            )
        
        return {
            "url": url,
            "expires_at": (datetime.utcnow() + timedelta(seconds=expires_in)).isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate signed URL: {str(e)}"
        )
