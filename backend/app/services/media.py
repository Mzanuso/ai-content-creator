from typing import Dict, Any, Optional, List, BinaryIO
import os
import uuid
from datetime import datetime
import mimetypes

from .firebase import FirebaseService
from app.schemas.media import MediaCreate, MediaUpdate, Media, MediaUpload

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
        """Create a new media item."""
        # Convert Pydantic model to dict
        media_dict = media_data.dict()
        
        # Add to Firebase
        media_id = FirebaseService.add_document(COLLECTION_NAME, media_dict)
        
        # Return created media
        return Media(id=media_id, **media_dict)

    @staticmethod
    async def update_media(media_id: str, media_data: MediaUpdate) -> Optional[Media]:
        """Update a media item."""
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
        """Delete a media item."""
        # Get media to get the file URL
        media = await MediaService.get_media(media_id)
        if not media:
            return False
        
        # Delete file from storage
        try:
            # Extract path from URL
            url_parts = media.url.split('/')
            file_path = '/'.join(url_parts[url_parts.index('o') + 1:])
            
            FirebaseService.delete_file(file_path)
        except Exception as e:
            print(f"Error deleting file: {e}")
        
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
    async def upload_media_file(
        project_id: str,
        file_content: bytes,
        file_name: str,
        media_type: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Media:
        """
        Upload a media file to Firebase Storage and create a media record.
        
        Parameters:
            project_id: The project ID
            file_content: The file content in bytes
            file_name: The name of the file
            media_type: The type of media ("image", "video", "audio")
            metadata: Additional metadata
            
        Returns:
            Created Media object
        """
        # Generate a unique filename
        file_extension = os.path.splitext(file_name)[1] if file_name else ""
        if not file_extension:
            # Try to guess the extension from content
            mime_type = mimetypes.guess_type(file_name)[0]
            if mime_type:
                file_extension = mimetypes.guess_extension(mime_type)
        
        # Generate a unique name
        unique_name = f"{uuid.uuid4()}{file_extension}"
        storage_path = f"projects/{project_id}/{media_type}/{unique_name}"
        
        # Upload to Firebase Storage
        url = FirebaseService.upload_file(file_content, storage_path)
        
        # Generate thumbnail URL for images
        thumbnail_url = None
        if media_type == "image":
            thumbnail_url = url  # For simplicity, use the same URL for now
        elif media_type == "video":
            # In a real implementation, generate a thumbnail from the video
            pass
        
        # Create media record
        media_data = MediaCreate(
            projectId=project_id,
            type=media_type,
            url=url,
            thumbnailUrl=thumbnail_url,
            metadata=metadata or {}
        )
        
        return await MediaService.create_media(media_data)

    @staticmethod
    async def edit_image(
        media_id: str,
        edits: Dict[str, Any]
    ) -> Optional[Media]:
        """
        Apply edits to an image.
        This is a placeholder implementation. In a real app, this would use
        image processing libraries or AI services to apply edits.
        
        Parameters:
            media_id: The media ID
            edits: Dictionary of edits to apply, e.g. {"crop": {...}, "filter": "sepia"}
            
        Returns:
            Updated Media object
        """
        # Get the media
        media = await MediaService.get_media(media_id)
        if not media or media.type != "image":
            return None
        
        # In a real implementation, download the image, apply edits, and upload the result
        # For now, just update the metadata to include the edits
        metadata = media.metadata or {}
        metadata["edits"] = edits
        
        # Update the media
        return await MediaService.update_media(media_id, MediaUpdate(metadata=metadata))

    @staticmethod
    async def generate_video_from_images(
        project_id: str,
        image_ids: List[str],
        settings: Dict[str, Any]
    ) -> Optional[Media]:
        """
        Generate a video from a sequence of images.
        This is a placeholder implementation. In a real app, this would use
        video processing libraries or services like Kling.
        
        Parameters:
            project_id: The project ID
            image_ids: List of image media IDs to include in the video
            settings: Dictionary of settings like duration, transitions, etc.
            
        Returns:
            Created Media object for the video
        """
        # In a real implementation, this would:
        # 1. Get all the images
        # 2. Generate a video using a service like Kling
        # 3. Upload the video to Firebase Storage
        # 4. Create a media record
        
        # For now, just create a placeholder media record
        media_data = MediaCreate(
            projectId=project_id,
            type="video",
            url="https://example.com/placeholder-video.mp4",
            thumbnailUrl="https://example.com/placeholder-thumbnail.jpg",
            metadata={
                "source": "generated",
                "images": image_ids,
                "settings": settings
            }
        )
        
        return await MediaService.create_media(media_data)

    @staticmethod
    async def generate_audio(
        project_id: str,
        audio_type: str,  # "music", "voiceover", "effect"
        settings: Dict[str, Any]
    ) -> Optional[Media]:
        """
        Generate audio (music, voiceover, effect).
        This is a placeholder implementation. In a real app, this would use
        audio generation services like Udio.
        
        Parameters:
            project_id: The project ID
            audio_type: Type of audio to generate
            settings: Dictionary of settings specific to the audio type
            
        Returns:
            Created Media object for the audio
        """
        # In a real implementation, this would:
        # 1. Generate audio using a service like Udio
        # 2. Upload the audio to Firebase Storage
        # 3. Create a media record
        
        # For now, just create a placeholder media record
        media_data = MediaCreate(
            projectId=project_id,
            type="audio",
            url="https://example.com/placeholder-audio.mp3",
            thumbnailUrl=None,
            metadata={
                "source": "generated",
                "audioType": audio_type,
                "settings": settings
            }
        )
        
        return await MediaService.create_media(media_data)
