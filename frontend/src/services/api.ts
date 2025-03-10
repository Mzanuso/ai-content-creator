import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { auth } from './firebase';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add authorization token
api.interceptors.request.use(
  async (config: AxiosRequestConfig) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      if (config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    // Handle session expiration (401 errors)
    if (error.response?.status === 401) {
      // Refresh token logic could go here
      // For now, just log the user out if their token is invalid
      // This would typically be handled by the auth slice
    }
    
    return Promise.reject(error);
  }
);

// API service functions
export const apiService = {
  // User endpoints
  getCurrentUser: () => api.get('/auth/me'),
  updateUserProfile: (data: any) => api.put('/users/profile', data),
  
  // Project endpoints
  getProjects: (page = 1, limit = 10) => 
    api.get(`/projects?page=${page}&limit=${limit}`),
  getProject: (id: string) => 
    api.get(`/projects/${id}`),
  createProject: (data: any) => 
    api.post('/projects', data),
  updateProject: (id: string, data: any) => 
    api.put(`/projects/${id}`, data),
  deleteProject: (id: string) => 
    api.delete(`/projects/${id}`),
  
  // Style endpoints
  getStyles: () => 
    api.get('/styles'),
  getStyleDetail: (srefCode: string) => 
    api.get(`/styles/${srefCode}`),
  
  // AI endpoints
  generateScreenplay: (data: any) => 
    api.post('/ai/writer/generate-screenplay', data),
  refineSection: (data: any) => 
    api.post('/ai/writer/refine-section', data),
  generateStoryboard: (data: any) => 
    api.post('/ai/director/generate-storyboard', data),
  generateImage: (data: any) => 
    api.post('/ai/midjourney/generate-image', data),
  generateVideo: (data: any) => 
    api.post('/ai/kling/generate-video', data),
  generateAudio: (data: any) => 
    api.post('/ai/udio/generate-audio', data),
  generateVoiceover: (data: any) => 
    api.post('/ai/voice/generate-voiceover', data),
  
  // Media endpoints
  uploadMedia: (file: File, projectId: string, type: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', projectId);
    formData.append('type', type);
    
    return api.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getMedia: (id: string) => 
    api.get(`/media/${id}`),
  deleteMedia: (id: string) => 
    api.delete(`/media/${id}`),
  editImage: (id: string, data: any) => 
    api.post(`/media/image/edit`, { id, ...data }),
  exportVideo: (data: any) => 
    api.post('/media/video/export', data),
};

export default api;