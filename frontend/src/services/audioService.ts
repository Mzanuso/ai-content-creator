import api from './api';

// Types
export interface MusicGenerationRequest {
  duration: number;
  mood?: string;
  tempo?: string;
  genre?: string;
  instruments?: string[];
}

export interface VoiceoverGenerationRequest {
  text: string;
  voice_id?: string;
  language?: string;
  speed?: number;
  pitch?: number;
}

export interface SoundEffectGenerationRequest {
  description: string;
  duration?: number;
}

export interface AudioTrackInfo {
  url: string;
  volume: number;
  start_time: number;
  fade_in?: number;
  fade_out?: number;
}

export interface AudioMixRequest {
  tracks: AudioTrackInfo[];
  output_format?: string;
}

export interface GenerationResponse {
  job_id: string;
  status: string;
}

export interface AudioResultResponse {
  url: string;
  duration: number;
  format: string;
  metadata: Record<string, any>;
}

// Audio service with methods to interact with backend audio API
const audioService = {
  // Background music generation
  generateMusic: (request: MusicGenerationRequest) => 
    api.post<GenerationResponse>('/audio/generate/music', request),
  
  // Voice-over generation
  generateVoiceover: (request: VoiceoverGenerationRequest) => 
    api.post<GenerationResponse>('/audio/generate/voiceover', request),
  
  // Sound effect generation
  generateSoundEffect: (request: SoundEffectGenerationRequest) => 
    api.post<GenerationResponse>('/audio/generate/soundeffect', request),
  
  // Mix multiple audio tracks
  mixAudioTracks: (request: AudioMixRequest) => 
    api.post<GenerationResponse>('/audio/mix', request),
  
  // Check generation status
  checkGenerationStatus: (jobId: string) => 
    api.get<Record<string, any>>(`/audio/status/${jobId}`),
  
  // Upload audio file
  uploadAudioFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post<Record<string, any>>('/audio/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Poll for completion
  pollForCompletion: async (jobId: string, maxAttempts = 30, intervalMs = 2000): Promise<AudioResultResponse> => {
    let attempts = 0;
    
    const checkStatus = async (): Promise<AudioResultResponse> => {
      attempts++;
      
      const response = await audioService.checkGenerationStatus(jobId);
      const data = response.data;
      
      if (data.status === 'completed' && data.result) {
        return {
          url: data.result.url,
          duration: data.result.duration || 0,
          format: data.result.format || 'mp3',
          metadata: data.result.metadata || {},
        };
      }
      
      if (data.status === 'error') {
        throw new Error(data.error || 'Audio generation failed');
      }
      
      if (attempts >= maxAttempts) {
        throw new Error('Maximum polling attempts reached');
      }
      
      // Wait and try again
      await new Promise(resolve => setTimeout(resolve, intervalMs));
      return checkStatus();
    };
    
    return checkStatus();
  },
  
  // Get common voice options
  getVoiceOptions: async () => {
    // This would typically fetch from a backend endpoint
    // For now, return hardcoded options
    return [
      { id: 'en_male_neutral', name: 'Male (Neutral)', language: 'en-US' },
      { id: 'en_female_neutral', name: 'Female (Neutral)', language: 'en-US' },
      { id: 'en_male_narrator', name: 'Male Narrator', language: 'en-US' },
      { id: 'en_female_narrator', name: 'Female Narrator', language: 'en-US' },
      { id: 'en_male_professional', name: 'Male Professional', language: 'en-US' },
      { id: 'en_female_professional', name: 'Female Professional', language: 'en-US' },
      { id: 'es_male_neutral', name: 'Male (Spanish)', language: 'es-ES' },
      { id: 'es_female_neutral', name: 'Female (Spanish)', language: 'es-ES' },
      { id: 'fr_male_neutral', name: 'Male (French)', language: 'fr-FR' },
      { id: 'fr_female_neutral', name: 'Female (French)', language: 'fr-FR' },
    ];
  },
  
  // Get music genres and moods
  getMusicOptions: async () => {
    // This would typically fetch from a backend endpoint
    // For now, return hardcoded options
    return {
      genres: [
        'Cinematic', 'Pop', 'Rock', 'Electronic', 'Jazz', 'Classical', 
        'Hip Hop', 'Ambient', 'Folk', 'R&B', 'Country'
      ],
      moods: [
        'Happy', 'Sad', 'Energetic', 'Calm', 'Tense', 'Mysterious', 
        'Romantic', 'Epic', 'Playful', 'Dramatic', 'Neutral'
      ],
      tempos: [
        'Very Slow', 'Slow', 'Medium', 'Fast', 'Very Fast'
      ]
    };
  }
};

export default audioService;
