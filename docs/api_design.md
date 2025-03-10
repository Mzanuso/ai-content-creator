# AI Content Creator - API Design

## API Endpoints

### Authentication

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh-token
POST /api/auth/logout
GET /api/auth/me
```

### Users

```
GET /api/users/{id}
PUT /api/users/{id}
GET /api/users/{id}/projects
GET /api/users/{id}/stats
```

### Projects

```
GET /api/projects
POST /api/projects
GET /api/projects/{id}
PUT /api/projects/{id}
DELETE /api/projects/{id}
GET /api/projects/{id}/versions
```

### Styles

```
GET /api/styles
GET /api/styles/{srefCode}
GET /api/styles/categories
GET /api/styles/recommended
```

### AI Services

```
POST /api/ai/writer/generate-screenplay
POST /api/ai/writer/refine-section
POST /api/ai/director/generate-storyboard
POST /api/ai/midjourney/generate-image
POST /api/ai/kling/generate-video
POST /api/ai/udio/generate-audio
POST /api/ai/voice/generate-voiceover
```

### Media

```
POST /api/media/upload
GET /api/media/{id}
DELETE /api/media/{id}
POST /api/media/image/edit
POST /api/media/video/export
```

## Data Models

### User

```json
{
  "id": "string",
  "email": "string",
  "displayName": "string",
  "photoURL": "string",
  "subscription": "free|premium|professional",
  "credits": "number",
  "createdAt": "timestamp",
  "lastLoginAt": "timestamp"
}
```

### Project

```json
{
  "id": "string",
  "userId": "string",
  "title": "string",
  "description": "string",
  "status": "draft|in-progress|completed",
  "aspectRatio": "16:9|9:16|1:1|custom",
  "targetDuration": "number",
  "styleData": {
    "srefCode": "string",
    "keywords": ["string"],
    "colorPalette": ["string"]
  },
  "screenplay": {
    "concept": "string",
    "sections": [
      {
        "id": "string",
        "text": "string",
        "order": "number"
      }
    ]
  },
  "storyboard": [
    {
      "id": "string",
      "sectionId": "string",
      "imageUrl": "string",
      "prompt": "string",
      "cameraSettings": "object",
      "order": "number"
    }
  ],
  "production": {
    "videoUrl": "string",
    "audioTracks": [
      {
        "id": "string",
        "type": "music|voiceover|effect",
        "url": "string",
        "settings": "object"
      }
    ],
    "exportSettings": "object"
  },
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Style

```json
{
  "srefCode": "string",
  "name": "string",
  "description": "string",
  "category": "string",
  "tags": ["string"],
  "previewUrl": "string",
  "exampleUrls": ["string"],
  "recommendedKeywords": ["string"]
}
```

### Media

```json
{
  "id": "string",
  "projectId": "string",
  "type": "image|video|audio",
  "url": "string",
  "thumbnailUrl": "string",
  "metadata": "object",
  "createdAt": "timestamp"
}
```