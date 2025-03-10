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
        """Get media by ID."""
        media_data = FirebaseService.get_document(COLLECTION_NAME, media_id)
        if not media_data:
            return None
        return Media(id=media_id, **media_data)

    @staticmethod
    async def create_media(media_data: MediaCreate) -> Media:
        """Create new media entry."""
        # Convert Pydantic model to dict
        media_dict = media_data.dict()
        
        # Add to Firebase
        media_id = FirebaseService.add_document(COLLECTION_NAME, media_dict)
        
        # Return created media
        return Media(id=media_id, **media_dict)

    @staticmethod
    async def update_media(media_id: str, media_data: MediaUpdate) -> Optional[Media]:
        """Update media."""
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
        """Delete media."""
        # Get media first to get the file path
        media = await MediaService.get_media(media_id)
        if not media:
            return False
        
        # Delete the file from storage if it exists
        if media.url and media.url.startswith("https://storage.googleapis.com/"):
            # Extract the path from the URL
            try:
                # URL format: https://storage.googleapis.com/[bucket]/[path]
                path = media.url.split("/", 4)[4]
                FirebaseService.delete_file(path)
            except Exception as e:
                print(f"Failed to delete file: {e}")
        
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
        return [Media(**item) for item in media_data]

    @staticmethod
    async def upload_media(
        project_id: str,
        file_data: bytes,
        file_name: str,
        media_type: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Media:
        """
        Upload media file to storage and create media entry.
        
        Parameters:
            project_id: The project ID
            file_data: The file content in bytes
            file_name: The original file name
            media_type: Type of media ("image", "video", "audio")
            metadata: Additional metadata
            
        Returns:
            Media object
        """
        # Generate unique file path
        file_extension = os.path.splitext(file_name)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        storage_path = f"projects/{project_id}/{media_type}/{unique_filename}"
        
        # Determine content type
        content_type = mimetypes.guess_type(file_name)[0]
        
        # Upload to storage
        url = FirebaseService.upload_file(file_data, storage_path, content_type)
        
        # Generate thumbnail for images and videos
        thumbnail_url = None
        if media_type == "image":
            # For images, we could use the same URL or generate a resized version
            thumbnail_url = url
        elif media_type == "video":
            # For videos, we would need to extract a frame
            # This is more complex and might require a separate service
            pass
        
        # Create media entry
        media_data = {
            "projectId": project_id,
            "type": media_type,
            "url": url,
            "thumbnailUrl": thumbnail_url,
            "metadata": metadata or {}
        }
        
        # Add to Firebase
        media_id = FirebaseService.add_document(COLLECTION_NAME, media_data)
        
        # Return created media
        return Media(id=media_id, **media_data)

    @staticmethod
    async def edit_image(
        media_id: str,
        edits: Dict[str, Any]
    ) -> Optional[Media]:
        """
        Apply edits to an image.
        
        Parameters:
            media_id: The media ID
            edits: Dictionary of edit operations
            
        Returns:
            Updated Media object or None if failed
            
        Note: This is a placeholder. In a real implementation, this would use
        image processing libraries or AI services to perform edits.
        """
        # Get the media
        media = await MediaService.get_media(media_id)
        if not media or media.type != "image":
            return None
        
        # In a real implementation, here we would:
        # 1. Download the image
        # 2. Apply the edits
        # 3. Upload the edited image
        # 4. Update the media entry
        
        # For now, we'll just update metadata to record the edits
        metadata = media.metadata.copy() if media.metadata else {}
        metadata["edits"] = metadata.get("edits", []) + [edits]
        
        # Update the media
        return await MediaService.update_media(media_id, MediaUpdate(metadata=metadata))

    @staticmethod
    async def export_video(
        project_id: str,
        format: str = "mp4",
        quality: str = "high",
        include_watermark: bool = True,
        include_soundtrack: bool = True,
        include_voiceover: bool = True,
        custom_settings: Optional[Dict[str, Any]] = None
    ) -> Optional[Media]:
        """
        Export a project as a video.
        
        Parameters:
            project_id: The project ID
            format: Export format (mp4, mov, etc.)
            quality: Export quality (low, medium, high)
            include_watermark: Whether to include watermark
            include_soundtrack: Whether to include soundtrack
            include_voiceover: Whether to include voiceover
            custom_settings: Additional export settings
            
        Returns:
            Media object for the exported video or None if failed
            
        Note: This is a placeholder. In a real implementation, this would use
        video processing libraries or services.
        """
        # In a real implementation, here we would:
        # 1. Generate the video using AI services
        # 2. Process the video with the specified settings
        # 3. Upload the video
        # 4. Create a media entry
        
        # For now, we'll create a dummy entry
        media_data = {
            "projectId": project_id,
            "type": "video",
            "url": f"https://example.com/placeholder_video_{uuid.uuid4()}.{format}",
            "thumbnailUrl": None,
            "metadata": {
                "format": format,
                "quality": quality,
                "include_watermark": include_watermark,
                "include_soundtrack": include_soundtrack,
                "include_voiceover": include_voiceover,
                "custom_settings": custom_settings or {},
                "export_status": "completed",  # In real app, this would be "processing" initially
                "export_time": datetime.utcnow().isoformat()
            }
        }
        
        # Add to Firebase
        media_id = FirebaseService.add_document(COLLECTION_NAME, media_data)
        
        # Return created media
        return Media(id=media_id, **media_data)
