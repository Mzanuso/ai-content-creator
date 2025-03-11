import os
import json
import logging
import httpx
from typing import Dict, Any, Optional, List
import asyncio

from app.core.config import settings

# Configure logging
logger = logging.getLogger(__name__)

class UdioService:
    """
    Service for interacting with the Udio API to generate audio content
    via the GoAPI wrapper.
    """
    
    def __init__(self):
        self.api_key = settings.GOAPI_API_KEY
        self.base_url = "https://api.goapi.io/udio"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    
    async def generate_music(
        self, 
        duration: int, 
        mood: Optional[str] = None,
        tempo: Optional[str] = None,
        genre: Optional[str] = None,
        instruments: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Generate background music using Udio API.
        
        Args:
            duration: Duration of the music in seconds
            mood: Emotional tone (happy, sad, tense, etc.)
            tempo: Speed of the music (slow, medium, fast)
            genre: Musical style (pop, rock, jazz, etc.)
            instruments: List of instruments to prioritize
            
        Returns:
            Dictionary containing the status and result data
        """
        url = f"{self.base_url}/generate/music"
        
        payload = {
            "duration": duration,
            "settings": {
                "mood": mood or "neutral",
                "tempo": tempo or "medium",
                "genre": genre or "cinematic",
                "instruments": instruments or []
            }
        }
        
        return await self._make_api_request(url, payload)
    
    async def generate_voice(
        self,
        text: str,
        voice_id: Optional[str] = None,
        language: str = "en-US",
        speed: float = 1.0,
        pitch: float = 0.0,
    ) -> Dict[str, Any]:
        """
        Generate voice-over narration using Udio API.
        
        Args:
            text: Text content to convert to speech
            voice_id: ID of the voice to use
            language: Language code (default: en-US)
            speed: Speech rate multiplier (0.5 to 2.0)
            pitch: Voice pitch adjustment (-1.0 to 1.0)
            
        Returns:
            Dictionary containing the status and result data
        """
        url = f"{self.base_url}/generate/voice"
        
        payload = {
            "text": text,
            "settings": {
                "voice_id": voice_id or "en_female_narrator",
                "language": language,
                "speed": speed,
                "pitch": pitch
            }
        }
        
        return await self._make_api_request(url, payload)
    
    async def generate_sound_effect(
        self,
        description: str,
        duration: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Generate sound effects using Udio API.
        
        Args:
            description: Description of the desired sound effect
            duration: Optional duration constraint in seconds
            
        Returns:
            Dictionary containing the status and result data
        """
        url = f"{self.base_url}/generate/sfx"
        
        payload = {
            "description": description,
            "settings": {}
        }
        
        if duration:
            payload["settings"]["duration"] = duration
        
        return await self._make_api_request(url, payload)
    
    async def mix_audio_tracks(
        self,
        tracks: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Mix multiple audio tracks with volume and timing adjustments.
        
        Args:
            tracks: List of tracks with url, volume, and timing information
            
        Returns:
            Dictionary containing the status and result data
        """
        url = f"{self.base_url}/mix"
        
        payload = {
            "tracks": tracks
        }
        
        return await self._make_api_request(url, payload)
    
    async def check_generation_status(self, job_id: str) -> Dict[str, Any]:
        """
        Check the status of an ongoing audio generation job.
        
        Args:
            job_id: ID of the generation job
            
        Returns:
            Dictionary containing the status information
        """
        url = f"{self.base_url}/status/{job_id}"
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, headers=self.headers)
                response.raise_for_status()
                return response.json()
            except httpx.HTTPStatusError as e:
                logger.error(f"HTTP error during status check: {e.response.status_code} - {e.response.text}")
                return {"status": "error", "error": f"HTTP error: {e.response.status_code}"}
            except httpx.RequestError as e:
                logger.error(f"Request error during status check: {str(e)}")
                return {"status": "error", "error": f"Request error: {str(e)}"}
    
    async def wait_for_completion(
        self, 
        job_id: str, 
        polling_interval: int = 5,
        max_attempts: int = 60
    ) -> Dict[str, Any]:
        """
        Wait for a generation job to complete with polling.
        
        Args:
            job_id: ID of the generation job
            polling_interval: Seconds between status checks
            max_attempts: Maximum number of polling attempts
            
        Returns:
            Dictionary containing the final result or error
        """
        attempt = 0
        
        while attempt < max_attempts:
            status_response = await self.check_generation_status(job_id)
            
            if status_response.get("status") == "completed":
                return status_response
            elif status_response.get("status") == "error":
                logger.error(f"Generation job failed: {status_response.get('error')}")
                return status_response
            
            attempt += 1
            await asyncio.sleep(polling_interval)
        
        return {"status": "error", "error": "Generation timeout exceeded"}
    
    async def _make_api_request(self, url: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Make a request to the Udio API with error handling.
        
        Args:
            url: API endpoint URL
            payload: Request payload data
            
        Returns:
            API response data or error information
        """
        async with httpx.AsyncClient() as client:
            try:
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


# Singleton instance for application-wide use
audio_service = UdioService()
