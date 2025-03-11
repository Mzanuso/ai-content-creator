from typing import Dict, Any, Optional, List, BinaryIO
import uuid
import os
from datetime import datetime

from .firebase import FirebaseService
from app.schemas.media import MediaCreate, MediaUpdate, Media, MediaUpload, MediaEdit

COLLECTION_NAME = "media"


class MediaService:
    """Service for media operations."""

    @staticmethod
    async def get_media(media_id: str) -> Optional[Media]:
        """Get a media item by ID."""
        media_data = FirebaseService.get_document(COLLECTION_NAME, media_id)
        if not media_data:
            return None
        return Media(id=media_id, **media_data)

    @staticmethod
    async def create_media(media_data: MediaCreate) -> Media:
        """Create a new media record."""
        # Convert Pydantic model to dict
        media_dict = media_data.dict()
        
        # Add to Firebase
        media_id = FirebaseService.add_document(COLLECTION_NAME, media_dict)
        
        # Return created media
        return Media(id=media_id, **media_dict)

    @staticmethod
    async def update_media(media_id: str, media_data: MediaUpdate) -> Optional[Media]:
        """Update a media record."""
        # Check if media exists
        existing_media = await MediaService.get_media(media_id)
        if not existing_media:
            return None
        
        # Convert Pydantic model to dict, excluding unset values
        update_data = media_data.dict(exclude_unset=True)
        
        # Update in Firebase
        FirebaseService.update_document(COLLECTION_NAME, media_id, update_data)
        
        # Get and return updated media
        return await MediaService.get_media(media_id)

    @staticmethod
    async def delete_media(media_id: str) -> bool:
        """Delete a media record and its associated file."""
        # Get media to get the URL
        media = await MediaService.get_media(media_id)
        if not media:
            return False
        
        # Extract file path from URL
        try:
            # Assuming the URL format includes a path that can be extracted
            # This might need to be adjusted based on your actual URL structure
            file_path = media.url.split("/")[-1]
            FirebaseService.delete_file(file_path)
        except Exception as e:
            print(f"Error deleting file: {e}")
            # Continue with deletion even if file deletion fails
        
        # Delete from Firestore
        return FirebaseService.delete_document(COLLECTION_NAME, media_id)

    @staticmethod
    async def get_project_media(project_id: str, media_type: Optional[str] = None) -> List[Media]:
        """Get all media for a project, with optional filtering by type."""
        # Setup where clauses
        where_clauses = [("projectId", "==", project_id)]
        if media_type:
            where_clauses.append(("type", "==", media_type))
        
        # Get media
        media_data = FirebaseService.get_documents(
            COLLECTION_NAME,
            where_clauses=where_clauses,
            order_by=[("createdAt", "desc")]
        )
        
        # Convert to Media objects
        return [Media(**data) for data in media_data]

    @staticmethod
    async def upload_media(
        upload_data: MediaUpload,
        generate_thumbnail: bool = True
    ) -> Media:
        """
        Upload a media file and create a record.
        
        Parameters:
            upload_data: The upload data including file and metadata
            generate_thumbnail: Whether to generate a thumbnail (for images and videos)
        """
        # Generate unique filename
        file_extension = os.path.splitext(upload_data.fileName or "file")[1] or ".bin"
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        
        # Determine storage path based on media type
        storage_path = f"media/{upload_data.type}/{unique_filename}"
        
        # Upload file to Firebase Storage
        content_type = None
        if upload_data.type == "image":
            content_type = f"image/{file_extension[1:]}"
        elif upload_data.type == "video":
            content_type = f"video/{file_extension[1:]}"
        elif upload_data.type == "audio":
            content_type = f"audio/{file_extension[1:]}"
        
        # Upload to Firebase Storage
        url = FirebaseService.upload_file(
            upload_data.file,
            storage_path,
            content_type
        )
        
        # Generate thumbnail if needed
        thumbnail_url = None
        if generate_thumbnail and upload_data.type in ["image", "video"]:
            # In a real implementation, you would generate a thumbnail
            # For now, just use the same URL
            thumbnail_url = url
        
        # Create media record
        media_data = MediaCreate(
            projectId=upload_data.projectId,
            type=upload_data.type,
            url=url,
            thumbnailUrl=thumbnail_url,
            metadata=upload_data.metadata or {}
        )
        
        return await MediaService.create_media(media_data)

    @staticmethod
    async def edit_image(edit_data: MediaEdit) -> Optional[Media]:
        """
        Apply edits to an image.
        
        Note: This is a simplified implementation. In a real application,
        you would use an image processing library like PIL or an external
        service to apply the edits, then upload the new version.
        """
        # Get the original image
        media = await MediaService.get_media(edit_data.id)
        if not media or media.type != "image":
            return None
        
        # In a real implementation, you would:
        # 1. Download the original image
        # 2. Apply edits
        # 3. Upload the edited image
        # 4. Update or create a new media record
        
        # For now, we'll just update the metadata to include the edits
        metadata = media.metadata or {}
        metadata["edits"] = edit_data.edits
        metadata["lastEdited"] = datetime.utcnow().isoformat()
        
        # Update the media record
        update_data = MediaUpdate(metadata=metadata)
        return await MediaService.update_media(edit_data.id, update_data)

    @staticmethod
    async def generate_export_url(
        project_id: str,
        format: str = "mp4",
        quality: str = "high",
        include_watermark: bool = True
    ) -> Optional[str]:
        """
        Generate a URL for exporting a project as a video.
        
        Note: This is a simplified implementation. In a real application,
        you would trigger a video export job and return a URL when complete.
        """
        # For now, just return a placeholder URL
        return f"https://example.com/exports/{project_id}.{format}"
