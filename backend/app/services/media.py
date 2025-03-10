from typing import Dict, Any, Optional, List, BinaryIO
import uuid
import os
from datetime import datetime

from .firebase import FirebaseService
from app.schemas.media import MediaCreate, MediaUpdate, Media, MediaUpload, MediaEdit, MediaExport

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
        """Create a new media entry."""
        # Convert Pydantic model to dict
        media_dict = media_data.dict()
        
        # Add to Firebase
        media_id = FirebaseService.add_document(COLLECTION_NAME, media_dict)
        
        # Return created media
        return Media(id=media_id, **media_dict)

    @staticmethod
    async def update_media(media_id: str, media_data: MediaUpdate) -> Optional[Media]:
        """Update a media entry."""
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
        """Delete a media entry and its associated file."""
        # Get media to retrieve file URL
        media = await MediaService.get_media(media_id)
        if not media:
            return False
        
        # Extract file path from URL
        # This assumes the URL format from Firebase Storage
        try:
            file_path = media.url.split(f"{media.projectId}/")[1]
            # Delete file from storage
            FirebaseService.delete_file(f"{media.projectId}/{file_path}")
        except Exception as e:
            print(f"Error deleting file: {e}")
        
        # Delete from Firestore
        return FirebaseService.delete_document(COLLECTION_NAME, media_id)

    @staticmethod
    async def upload_media(upload_data: MediaUpload) -> Optional[Media]:
        """Upload a media file and create associated entry."""
        # Generate unique filename
        file_extension = ""
        if upload_data.fileName:
            file_extension = os.path.splitext(upload_data.fileName)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        
        # Determine folder based on media type
        type_folder = upload_data.type  # "image", "video", "audio"
        file_path = f"{upload_data.projectId}/{type_folder}/{unique_filename}"
        
        # Determine content type
        content_type = None
        if upload_data.type == "image":
            if file_extension.lower() in [".jpg", ".jpeg"]:
                content_type = "image/jpeg"
            elif file_extension.lower() == ".png":
                content_type = "image/png"
            elif file_extension.lower() == ".svg":
                content_type = "image/svg+xml"
        elif upload_data.type == "video":
            if file_extension.lower() == ".mp4":
                content_type = "video/mp4"
        elif upload_data.type == "audio":
            if file_extension.lower() == ".mp3":
                content_type = "audio/mpeg"
            elif file_extension.lower() == ".wav":
                content_type = "audio/wav"
        
        # Upload file to Firebase Storage
        try:
            file_url = FirebaseService.upload_file(
                upload_data.file,
                file_path,
                content_type
            )
        except Exception as e:
            print(f"Error uploading file: {e}")
            return None
        
        # Create thumbnail for images and videos
        thumbnail_url = ""
        if upload_data.type == "image":
            # For images, we could use the same image as thumbnail
            # In a real implementation, we would resize it
            thumbnail_url = file_url
        elif upload_data.type == "video":
            # For videos, we would generate a thumbnail
            # This would typically involve a video processing service
            pass
        
        # Create media entry in Firestore
        media_data = MediaCreate(
            projectId=upload_data.projectId,
            type=upload_data.type,
            url=file_url,
            thumbnailUrl=thumbnail_url,
            metadata=upload_data.metadata
        )
        
        return await MediaService.create_media(media_data)

    @staticmethod
    async def get_project_media(project_id: str, media_type: Optional[str] = None) -> List[Media]:
        """Get all media for a project, optionally filtered by type."""
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
        return [Media(**media) for media in media_data]

    @staticmethod
    async def edit_media(edit_data: MediaEdit) -> Optional[Media]:
        """
        Edit a media file with the specified operations.
        
        This is a placeholder function that would need to be implemented
        with a proper image/video/audio editing service.
        """
        # Get media
        media = await MediaService.get_media(edit_data.id)
        if not media:
            return None
        
        # Update metadata to reflect the edits
        updated_metadata = media.metadata or {}
        updated_metadata["edits"] = updated_metadata.get("edits", []) + [edit_data.edits]
        
        # In a real implementation, this would apply the edits to the media file
        # and upload the new version. For now, we just update the metadata.
        update_data = MediaUpdate(metadata=updated_metadata)
        
        return await MediaService.update_media(edit_data.id, update_data)

    @staticmethod
    async def export_media(export_data: MediaExport) -> Optional[str]:
        """
        Export a project's media with specified settings.
        
        This is a placeholder function that would need to be implemented
        with a proper media export service.
        
        Returns:
            URL to the exported file, or None if export failed
        """
        # In a real implementation, this would:
        # 1. Get all media for the project
        # 2. Combine them according to the project timeline/storyboard
        # 3. Apply any effects, transitions, etc.
        # 4. Encode to the specified format and quality
        # 5. Upload the result to Firebase Storage
        # 6. Return the URL
        
        # For now, just return a placeholder
        return f"https://example.com/exports/{export_data.projectId}.{export_data.format}"
