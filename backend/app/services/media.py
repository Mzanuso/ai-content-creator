from typing import Dict, Any, Optional, List, BinaryIO
import os
import uuid
from datetime import datetime
import mimetypes

from .firebase import FirebaseService
from app.schemas.media import MediaCreate, MediaUpdate, Media, MediaUpload, MediaEdit, MediaExport

COLLECTION_NAME = "media"


class MediaService:
    """Service for media operations."""

    @staticmethod
    async def get_media(media_id: str) -> Optional[Media]:
        """Get a media by ID."""
        media_data = FirebaseService.get_document(COLLECTION_NAME, media_id)
        if not media_data:
            return None
        return Media(id=media_id, **media_data)

    @staticmethod
    async def upload_media(media_upload: MediaUpload) -> Media:
        """Upload a new media file and create a record."""
        # Generate a unique filename
        filename = media_upload.fileName or f"{uuid.uuid4()}"
        if not "." in filename:
            # Add appropriate extension based on media type
            if media_upload.type == "image":
                filename += ".jpg"
            elif media_upload.type == "video":
                filename += ".mp4"
            elif media_upload.type == "audio":
                filename += ".mp3"
        
        # Determine the storage path
        project_id = media_upload.projectId
        media_type = media_upload.type
        storage_path = f"projects/{project_id}/{media_type}/{filename}"
        
        # Determine content type
        content_type = mimetypes.guess_type(filename)[0]
        if not content_type:
            if media_type == "image":
                content_type = "image/jpeg"
            elif media_type == "video":
                content_type = "video/mp4"
            elif media_type == "audio":
                content_type = "audio/mpeg"
        
        # Upload file to Firebase Storage
        url = FirebaseService.upload_file(
            file_data=media_upload.file,
            file_path=storage_path,
            content_type=content_type
        )
        
        # Create thumbnail for images and videos
        thumbnail_url = None
        if media_type in ["image", "video"]:
            # In a real app, you'd implement thumbnail generation
            # For now, we'll use the same URL
            thumbnail_url = url
        
        # Create media record
        media_data = MediaCreate(
            projectId=project_id,
            type=media_type,
            url=url,
            thumbnailUrl=thumbnail_url,
            metadata=media_upload.metadata or {}
        )
        
        # Add to Firestore
        media_id = FirebaseService.add_document(COLLECTION_NAME, media_data.dict())
        
        # Return created media
        return Media(id=media_id, **media_data.dict())

    @staticmethod
    async def update_media(media_id: str, media_data: MediaUpdate) -> Optional[Media]:
        """Update a media record."""
        # Check if media exists
        existing_media = await MediaService.get_media(media_id)
        if not existing_media:
            return None
        
        # Convert Pydantic model to dict, excluding unset values
        update_data = media_data.dict(exclude_unset=True)
        
        # Update in Firestore
        FirebaseService.update_document(COLLECTION_NAME, media_id, update_data)
        
        # Get and return updated media
        return await MediaService.get_media(media_id)

    @staticmethod
    async def delete_media(media_id: str) -> bool:
        """Delete a media and its file."""
        # Get media data
        media = await MediaService.get_media(media_id)
        if not media:
            return False
        
        # Extract file path from URL
        # This assumes the URL is structured in a way that the path can be extracted
        # In a real app, you might need a more robust way to get the file path
        try:
            url_parts = media.url.split("?")[0].split("/")
            file_name = url_parts[-1]
            project_id = media.projectId
            file_path = f"projects/{project_id}/{media.type}/{file_name}"
            
            # Delete file from Storage
            FirebaseService.delete_file(file_path)
            
            # Delete thumbnail if exists
            if media.thumbnailUrl and media.thumbnailUrl != media.url:
                thumbnail_parts = media.thumbnailUrl.split("?")[0].split("/")
                thumbnail_name = thumbnail_parts[-1]
                thumbnail_path = f"projects/{project_id}/{media.type}/thumbnails/{thumbnail_name}"
                FirebaseService.delete_file(thumbnail_path)
        except Exception as e:
            print(f"Error deleting file from storage: {e}")
        
        # Delete from Firestore
        return FirebaseService.delete_document(COLLECTION_NAME, media_id)

    @staticmethod
    async def get_project_media(
        project_id: str, 
        media_type: Optional[str] = None,
        sort_by: str = "createdAt",
        sort_direction: str = "desc"
    ) -> List[Media]:
        """Get all media for a project with optional filtering by type."""
        # Setup where clauses
        where_clauses = [("projectId", "==", project_id)]
        if media_type:
            where_clauses.append(("type", "==", media_type))
        
        # Get media
        media_data = FirebaseService.get_documents(
            COLLECTION_NAME,
            where_clauses=where_clauses,
            order_by=[(sort_by, sort_direction)]
        )
        
        # Convert to Media objects
        return [Media(**item) for item in media_data]

    @staticmethod
    async def edit_media(media_edit: MediaEdit) -> Optional[Media]:
        """
        Apply edits to a media file.
        
        This would typically involve image processing operations like:
        - Crop, resize, rotate
        - Apply filters
        - Adjust brightness, contrast, etc.
        - More advanced AI operations like face swapping, inpainting, etc.
        
        For now, this is a placeholder implementation that just updates metadata.
        In a real app, you would integrate with image/video processing libraries
        or AI services for the actual transformations.
        """
        # Get media
        media = await MediaService.get_media(media_edit.id)
        if not media:
            return None
        
        # Update metadata to reflect edits
        metadata = media.metadata or {}
        metadata["edits"] = metadata.get("edits", []) + [
            {
                "type": "edit",
                "operations": media_edit.edits,
                "timestamp": datetime.utcnow().isoformat()
            }
        ]
        
        # In a real implementation, you would:
        # 1. Download the media file
        # 2. Apply the edits
        # 3. Upload the new version
        # 4. Update the URL and metadata
        
        # For now, just update the metadata
        return await MediaService.update_media(
            media_edit.id,
            MediaUpdate(metadata=metadata)
        )

    @staticmethod
    async def export_video(export_config: MediaExport) -> Optional[Dict[str, Any]]:
        """
        Export a video with the specified settings.
        
        In a real app, this would involve:
        1. Getting all relevant media (images, audio, etc.)
        2. Composing them into a video
        3. Applying transitions, effects, etc.
        4. Exporting to the desired format
        5. Uploading the result to storage
        
        For now, this is a placeholder implementation.
        """
        # Get project media
        media_items = await MediaService.get_project_media(export_config.projectId)
        if not media_items:
            return None
        
        # In a real implementation, you would use a video composition library
        # or service to create the final video
        
        # For now, return a mock response
        return {
            "projectId": export_config.projectId,
            "status": "processing",
            "exportId": str(uuid.uuid4()),
            "config": export_config.dict(),
            "estimatedCompletionTime": "60",  # in seconds
            "statusUrl": f"/api/v1/media/export/status/{export_config.projectId}"
        }
