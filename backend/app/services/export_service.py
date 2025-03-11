import logging
import os
import asyncio
import json
import uuid
import httpx
from typing import Dict, Any, Optional, List, Tuple
from datetime import datetime, timedelta

from firebase_admin import storage
from app.core.config import settings

# Configure logging
logger = logging.getLogger(__name__)

class ExportService:
    """
    Service for video export and sharing functionality
    """
    
    def __init__(self):
        self.api_key = settings.GOAPI_API_KEY
        self.base_url = "https://api.goapi.io/kling/export"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        self.firebase_bucket = storage.bucket()
    
    async def export_video(
        self, 
        project_id: str,
        user_id: str,
        video_url: str,
        audio_url: Optional[str] = None,
        format: str = "mp4",
        quality: str = "high",
        resolution: str = "1080p",
        fps: int = 30,
        include_audio: bool = True,
        compress_file: bool = True,
        add_watermark: bool = False,
        optimize_for_web: bool = True
    ) -> Dict[str, Any]:
        """
        Export a video with specified settings
        
        Args:
            project_id: ID of the project
            user_id: ID of the user
            video_url: URL of the video to export
            audio_url: Optional URL of the audio track
            format: Output format (mp4, webm, mov, gif)
            quality: Video quality (low, medium, high, ultra)
            resolution: Output resolution (480p, 720p, 1080p, 4k)
            fps: Frames per second
            include_audio: Whether to include audio
            compress_file: Whether to compress the output file
            add_watermark: Whether to add a watermark
            optimize_for_web: Whether to optimize for web sharing
            
        Returns:
            Dictionary with job ID and status
        """
        url = f"{self.base_url}/video"
        
        # Prepare the payload
        payload = {
            "source_url": video_url,
            "output": {
                "format": format,
                "quality": quality,
                "resolution": resolution,
                "fps": fps,
                "options": {
                    "include_audio": include_audio,
                    "compress": compress_file,
                    "watermark": add_watermark,
                    "web_optimize": optimize_for_web
                }
            },
            "metadata": {
                "project_id": project_id,
                "user_id": user_id,
                "export_time": datetime.utcnow().isoformat()
            }
        }
        
        # Add audio track if provided
        if audio_url and include_audio:
            payload["audio_url"] = audio_url
        
        # Send the request
        response = await self._make_api_request(url, payload)
        
        if response.get("status") == "error":
            logger.error(f"Export request failed: {response.get('error')}")
            return {
                "status": "error",
                "error": response.get("error", "Unknown error"),
                "timestamp": datetime.utcnow().isoformat()
            }
        
        # Create a record in Firebase Storage
        job_id = response.get("job_id", str(uuid.uuid4()))
        
        # Create a storage reference
        export_ref = self.firebase_bucket.blob(f"exports/{user_id}/{project_id}/{job_id}.json")
        
        # Store the export configuration
        export_data = {
            "job_id": job_id,
            "project_id": project_id,
            "user_id": user_id,
            "status": "processing",
            "config": {
                "format": format,
                "quality": quality,
                "resolution": resolution,
                "fps": fps,
                "include_audio": include_audio,
                "compress_file": compress_file,
                "add_watermark": add_watermark,
                "optimize_for_web": optimize_for_web
            },
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        # Upload the data
        export_ref.upload_from_string(
            json.dumps(export_data),
            content_type="application/json"
        )
        
        return {
            "job_id": job_id,
            "status": "processing",
            "timestamp": datetime.utcnow().isoformat()
        }
    
    async def check_export_status(self, job_id: str) -> Dict[str, Any]:
        """
        Check the status of an export job
        
        Args:
            job_id: ID of the export job
            
        Returns:
            Dictionary with status and result information
        """
        url = f"{self.base_url}/status/{job_id}"
        
        try:
            response = await self._make_api_request(url, {}, method="GET")
            
            if response.get("status") == "error":
                logger.error(f"Status check failed: {response.get('error')}")
                return {
                    "status": "error",
                    "error": response.get("error", "Unknown error"),
                    "timestamp": datetime.utcnow().isoformat()
                }
            
            # Update the record in Firebase Storage
            # In a production environment, we would fetch the blob path from a database
            # For now, we'll use a generic path format
            try:
                export_blobs = list(self.firebase_bucket.list_blobs(prefix=f"exports"))
                for blob in export_blobs:
                    if job_id in blob.name and blob.name.endswith(".json"):
                        export_data = json.loads(blob.download_as_string())
                        export_data["status"] = response.get("status")
                        export_data["updated_at"] = datetime.utcnow().isoformat()
                        
                        if response.get("status") == "completed":
                            export_data["result"] = response.get("result")
                            export_data["completed_at"] = datetime.utcnow().isoformat()
                        
                        blob.upload_from_string(
                            json.dumps(export_data),
                            content_type="application/json"
                        )
                        break
            except Exception as e:
                logger.error(f"Failed to update export record: {str(e)}")
            
            return response
        
        except Exception as e:
            logger.error(f"Status check error: {str(e)}")
            return {
                "status": "error",
                "error": f"Status check failed: {str(e)}",
                "timestamp": datetime.utcnow().isoformat()
            }
    
    async def share_video(
        self,
        user_id: str,
        project_id: str,
        export_url: str,
        platform: str,
        title: str,
        description: str,
        tags: List[str],
        visibility: str = "unlisted"
    ) -> Dict[str, Any]:
        """
        Share a video to a social media platform
        
        Args:
            user_id: ID of the user
            project_id: ID of the project
            export_url: URL of the exported video
            platform: Social platform to share to
            title: Title of the video
            description: Description of the video
            tags: List of tags for the video
            visibility: Visibility setting (public, unlisted, private)
            
        Returns:
            Dictionary with sharing status and link
        """
        if platform not in ["youtube", "vimeo", "facebook", "twitter", "linkedin", "instagram", "direct"]:
            return {
                "status": "error",
                "error": f"Unsupported platform: {platform}",
                "timestamp": datetime.utcnow().isoformat()
            }
        
        # Direct link sharing just returns the export URL
        if platform == "direct":
            return {
                "status": "completed",
                "platform": "direct",
                "url": export_url,
                "timestamp": datetime.utcnow().isoformat()
            }
        
        # For other platforms, we would implement specific API integrations
        # For now, we'll simulate the process
        
        # Generate a unique share ID
        share_id = str(uuid.uuid4())
        
        # Create a storage reference for the share record
        share_ref = self.firebase_bucket.blob(f"shares/{user_id}/{project_id}/{share_id}.json")
        
        # Simulate processing delay
        await asyncio.sleep(2)
        
        # Create a mock share response
        share_data = {
            "id": share_id,
            "user_id": user_id,
            "project_id": project_id,
            "platform": platform,
            "status": "completed",
            "title": title,
            "description": description,
            "tags": tags,
            "visibility": visibility,
            "url": f"https://example.com/{platform}/share/{share_id}",
            "created_at": datetime.utcnow().isoformat()
        }
        
        # Upload the share data
        share_ref.upload_from_string(
            json.dumps(share_data),
            content_type="application/json"
        )
        
        return {
            "status": "completed",
            "platform": platform,
            "share_id": share_id,
            "url": share_data["url"],
            "timestamp": datetime.utcnow().isoformat()
        }
    
    async def get_user_exports(
        self, 
        user_id: str, 
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Get a list of exports for a user
        
        Args:
            user_id: ID of the user
            limit: Maximum number of exports to return
            
        Returns:
            List of export records
        """
        try:
            # Get exports for the user
            export_blobs = list(self.firebase_bucket.list_blobs(prefix=f"exports/{user_id}"))
            
            # Sort by creation time (newest first)
            export_blobs.sort(key=lambda blob: blob.time_created, reverse=True)
            
            # Get the data from each blob
            exports = []
            for blob in export_blobs[:limit]:
                if blob.name.endswith(".json"):
                    try:
                        export_data = json.loads(blob.download_as_string())
                        exports.append(export_data)
                    except Exception as e:
                        logger.error(f"Failed to parse export data: {str(e)}")
            
            return exports
        
        except Exception as e:
            logger.error(f"Failed to get user exports: {str(e)}")
            return []
    
    async def get_export_details(
        self, 
        user_id: str, 
        export_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Get details of a specific export
        
        Args:
            user_id: ID of the user
            export_id: ID of the export
            
        Returns:
            Export details or None if not found
        """
        try:
            # Try to find the export record
            export_blobs = list(self.firebase_bucket.list_blobs(prefix=f"exports/{user_id}"))
            
            for blob in export_blobs:
                if export_id in blob.name and blob.name.endswith(".json"):
                    try:
                        export_data = json.loads(blob.download_as_string())
                        return export_data
                    except Exception as e:
                        logger.error(f"Failed to parse export data: {str(e)}")
                        return None
            
            return None
        
        except Exception as e:
            logger.error(f"Failed to get export details: {str(e)}")
            return None
    
    async def generate_signed_url(self, cloud_path: str, expires_in: int = 3600) -> str:
        """
        Generate a signed URL for accessing a file
        
        Args:
            cloud_path: Path of the file in cloud storage
            expires_in: Seconds until URL expiration
            
        Returns:
            Signed URL for the file
        """
        try:
            blob = self.firebase_bucket.blob(cloud_path)
            
            # Generate a signed URL that expires after the specified time
            url = blob.generate_signed_url(
                version="v4",
                expiration=timedelta(seconds=expires_in),
                method="GET"
            )
            
            return url
        
        except Exception as e:
            logger.error(f"Failed to generate signed URL: {str(e)}")
            return ""
    
    async def _make_api_request(
        self, 
        url: str, 
        payload: Dict[str, Any],
        method: str = "POST"
    ) -> Dict[str, Any]:
        """
        Make a request to the export API
        
        Args:
            url: API endpoint URL
            payload: Request payload data
            method: HTTP method
            
        Returns:
            API response data
        """
        try:
            async with httpx.AsyncClient() as client:
                if method == "GET":
                    response = await client.get(
                        url, 
                        headers=self.headers,
                        timeout=30.0
                    )
                else:
                    response = await client.post(
                        url, 
                        headers=self.headers,
                        json=payload,
                        timeout=30.0
                    )
                
                response.raise_for_status()
                return response.json()
        
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error during API request: {e.response.status_code} - {e.response.text}")
            return {"status": "error", "error": f"HTTP error: {e.response.status_code}"}
        
        except httpx.RequestError as e:
            logger.error(f"Request error during API request: {str(e)}")
            return {"status": "error", "error": f"Request error: {str(e)}"}
        
        except Exception as e:
            logger.error(f"Unexpected error during API request: {str(e)}")
            return {"status": "error", "error": f"Unexpected error: {str(e)}"}

# Singleton instance for application-wide use
export_service = ExportService()
