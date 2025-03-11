import { rest } from 'msw';
import { mockProjects } from './mockData/projects';
import { mockStyles } from './mockData/styles';
import { mockExports } from './mockData/exports';
import { mockUser } from './mockData/users';

// URL base dell'API
const API_URL = 'http://localhost:8000/api/v1';

export const handlers = [
  // Auth handlers
  rest.post(`${API_URL}/auth/login`, (req, res, ctx) => {
    // Successo di login
    return res(
      ctx.status(200),
      ctx.json({
        access_token: 'mock-jwt-token',
        token_type: 'bearer',
        user: mockUser,
      })
    );
  }),
  
  rest.post(`${API_URL}/auth/register`, (req, res, ctx) => {
    // Successo di registrazione
    return res(
      ctx.status(201),
      ctx.json({
        access_token: 'mock-jwt-token',
        token_type: 'bearer',
        user: mockUser,
      })
    );
  }),
  
  rest.get(`${API_URL}/auth/me`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(mockUser)
    );
  }),
  
  // Projects handlers
  rest.get(`${API_URL}/projects`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        projects: mockProjects,
        count: mockProjects.length,
      })
    );
  }),
  
  rest.get(`${API_URL}/projects/:id`, (req, res, ctx) => {
    const { id } = req.params;
    const project = mockProjects.find(p => p.id === id);
    
    if (!project) {
      return res(
        ctx.status(404),
        ctx.json({ detail: 'Project not found' })
      );
    }
    
    return res(
      ctx.status(200),
      ctx.json(project)
    );
  }),
  
  rest.post(`${API_URL}/projects`, (req, res, ctx) => {
    // Creazione progetto
    const newProject = {
      id: 'new-project-id',
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    return res(
      ctx.status(201),
      ctx.json(newProject)
    );
  }),
  
  // Styles handlers
  rest.get(`${API_URL}/styles`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        styles: mockStyles,
        count: mockStyles.length,
      })
    );
  }),
  
  // AI handlers
  rest.post(`${API_URL}/ai/writer/generate-screenplay`, (req, res, ctx) => {
    // Genera screenplay
    return res(
      ctx.status(200),
      ctx.json({
        concept: req.body.concept,
        sections: [
          { id: 'section-1', text: 'Generated section 1', order: 0 },
          { id: 'section-2', text: 'Generated section 2', order: 1 },
          { id: 'section-3', text: 'Generated section 3', order: 2 },
          { id: 'section-4', text: 'Generated section 4', order: 3 },
          { id: 'section-5', text: 'Generated section 5', order: 4 },
        ]
      })
    );
  }),
  
  rest.post(`${API_URL}/ai/director/generate-storyboard`, (req, res, ctx) => {
    // Genera storyboard
    return res(
      ctx.status(200),
      ctx.json({
        prompts: [
          { sectionId: 'section-1', prompt: 'Generated prompt 1', cameraMovement: 'pan' },
          { sectionId: 'section-2', prompt: 'Generated prompt 2', cameraMovement: 'zoom' },
          { sectionId: 'section-3', prompt: 'Generated prompt 3', cameraMovement: 'static' },
          { sectionId: 'section-4', prompt: 'Generated prompt 4', cameraMovement: 'dolly' },
          { sectionId: 'section-5', prompt: 'Generated prompt 5', cameraMovement: 'tilt' },
        ]
      })
    );
  }),
  
  // Audio handlers
  rest.post(`${API_URL}/audio/generate/music`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        job_id: 'music-job-id',
        status: 'processing',
      })
    );
  }),
  
  rest.post(`${API_URL}/audio/generate/voiceover`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        job_id: 'voiceover-job-id',
        status: 'processing',
      })
    );
  }),
  
  rest.get(`${API_URL}/audio/status/:jobId`, (req, res, ctx) => {
    const { jobId } = req.params;
    
    // Simula completamento dopo un po'
    return res(
      ctx.status(200),
      ctx.json({
        job_id: jobId,
        status: 'completed',
        result: {
          url: 'https://example.com/audio.mp3',
          duration: 30,
        }
      })
    );
  }),
  
  // Export handlers
  rest.post(`${API_URL}/export/video`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        job_id: 'export-job-id',
        status: 'processing',
        timestamp: new Date().toISOString(),
      })
    );
  }),
  
  rest.post(`${API_URL}/export/share`, (req, res, ctx) => {
    const { platform } = req.body;
    
    return res(
      ctx.status(200),
      ctx.json({
        status: 'completed',
        platform,
        url: `https://example.com/${platform}/shared-video`,
        share_id: 'share-id',
        timestamp: new Date().toISOString(),
      })
    );
  }),
  
  rest.get(`${API_URL}/export/status/:jobId`, (req, res, ctx) => {
    const { jobId } = req.params;
    
    return res(
      ctx.status(200),
      ctx.json({
        status: 'completed',
        progress: 100,
        result: {
          url: 'https://example.com/exported-video.mp4',
          format: 'mp4',
          duration: 60,
          resolution: '1080p',
          file_size: 10485760, // 10MB
        }
      })
    );
  }),
  
  rest.get(`${API_URL}/export/user`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        exports: mockExports,
        count: mockExports.length,
      })
    );
  }),
];
