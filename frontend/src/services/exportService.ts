import api from './api';

// Types
export interface ExportVideoRequest {
  project_id: string;
  video_url: string;
  audio_url?: string;
  format?: 'mp4' | 'webm' | 'mov' | 'gif';
  quality?: 'low' | 'medium' | 'high' | 'ultra';
  resolution?: '480p' | '720p' | '1080p' | '4k';
  fps?: number;
  include_audio?: boolean;
  compress_file?: boolean;
  add_watermark?: boolean;
  optimize_for_web?: boolean;
}

export interface ShareVideoRequest {
  project_id: string;
  export_url: string;
  platform: 'youtube' | 'vimeo' | 'facebook' | 'twitter' | 'linkedin' | 'instagram' | 'direct';
  title: string;
  description: string;
  tags?: string[];
  visibility?: 'public' | 'unlisted' | 'private';
}

export interface ExportResponse {
  job_id: string;
  status: string;
  timestamp: string;
}

export interface ShareResponse {
  status: string;
  platform: string;
  url?: string;
  share_id?: string;
  timestamp: string;
}

export interface ExportStatus {
  status: string;
  progress?: number;
  result?: {
    url: string;
    format: string;
    duration: number;
    resolution: string;
    file_size: number;
  };
  error?: string;
}

export interface ExportDetails {
  job_id: string;
  project_id: string;
  user_id: string;
  status: string;
  config: {
    format: string;
    quality: string;
    resolution: string;
    fps: number;
    include_audio: boolean;
    compress_file: boolean;
    add_watermark: boolean;
    optimize_for_web: boolean;
  };
  created_at: string;
  updated_at: string;
  result?: any;
  completed_at?: string;
}

export interface UserExportsResponse {
  exports: ExportDetails[];
  count: number;
}

export interface SignedUrlResponse {
  url: string;
  expires_at: string;
}

// Export service with methods to interact with backend export API
const exportService = {
  // Export a video with specified settings
  exportVideo: (request: ExportVideoRequest) => 
    api.post<ExportResponse>('/export/video', request),
  
  // Share a video to a social media platform
  shareVideo: (request: ShareVideoRequest) =>
    api.post<ShareResponse>('/export/share', request),
    
  // Check the status of an export job
  checkExportStatus: (jobId: string) =>
    api.get<ExportStatus>(`/export/status/${jobId}`),
  
  // Get a list of exports for the current user
  getUserExports: (limit: number = 10) =>
    api.get<UserExportsResponse>(`/export/user?limit=${limit}`),
  
  // Get details of a specific export
  getExportDetails: (exportId: string) =>
    api.get<ExportDetails>(`/export/${exportId}`),
  
  // Generate a signed URL for accessing a file
  generateSignedUrl: (cloudPath: string, expiresIn: number = 3600) =>
    api.get<SignedUrlResponse>(`/export/signed-url/${cloudPath}?expires_in=${expiresIn}`),
  
  // Poll for export completion
  pollForCompletion: async (jobId: string, maxAttempts = 30, intervalMs = 2000): Promise<ExportStatus> => {
    let attempts = 0;
    
    const checkStatus = async (): Promise<ExportStatus> => {
      attempts++;
      
      const response = await exportService.checkExportStatus(jobId);
      const data = response.data;
      
      if (data.status === 'completed') {
        return data;
      }
      
      if (data.status === 'error') {
        throw new Error(data.error || 'Export failed');
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
  
  // Get export format options
  getExportFormatOptions: () => {
    return {
      formats: [
        { id: 'mp4', name: 'MP4 (H.264)', description: 'Most Compatible' },
        { id: 'webm', name: 'WebM (VP9)', description: 'Web Optimized' },
        { id: 'mov', name: 'MOV (ProRes)', description: 'High Quality' },
        { id: 'gif', name: 'GIF', description: 'Animation' },
      ],
      qualities: [
        { id: 'ultra', name: 'Ultra', description: 'Maximum Quality' },
        { id: 'high', name: 'High', description: 'Recommended' },
        { id: 'medium', name: 'Medium', description: 'Balanced' },
        { id: 'low', name: 'Low', description: 'Smallest File' },
      ],
      resolutions: [
        { id: '4k', name: '4K', description: '3840 x 2160' },
        { id: '1080p', name: 'Full HD', description: '1920 x 1080' },
        { id: '720p', name: 'HD', description: '1280 x 720' },
        { id: '480p', name: 'SD', description: '854 x 480' },
      ],
      frameRates: [
        { id: 60, name: '60 fps', description: 'Smooth Motion' },
        { id: 30, name: '30 fps', description: 'Standard' },
        { id: 24, name: '24 fps', description: 'Cinematic' },
        { id: 15, name: '15 fps', description: 'Low Bandwidth' },
      ],
    };
  },
  
  // Get sharing platform options
  getSharingPlatformOptions: () => {
    return [
      { id: 'direct', name: 'Direct Link', icon: 'link' },
      { id: 'youtube', name: 'YouTube', icon: 'youtube' },
      { id: 'vimeo', name: 'Vimeo', icon: 'vimeo' },
      { id: 'facebook', name: 'Facebook', icon: 'facebook' },
      { id: 'twitter', name: 'Twitter', icon: 'twitter' },
      { id: 'instagram', name: 'Instagram', icon: 'instagram' },
      { id: 'linkedin', name: 'LinkedIn', icon: 'linkedin' },
    ];
  },
};

export default exportService;
