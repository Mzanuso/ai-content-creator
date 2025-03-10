# AI Content Creator

An AI-powered platform for creating professional video content through a guided creative workflow.

## Project Overview

AI Content Creator is a web application that allows users to create high-quality video content by leveraging multiple AI technologies. The platform guides users through a structured four-stage creative process:

1. **Style Selection**: Choose visual aesthetics, color palettes, and style references
2. **Storytelling**: Create narratives with AI-assisted screenplay generation
3. **Storyboard**: Visualize scenes with AI-generated images using Midjourney
4. **Video & Audio**: Generate final videos with AI animation, music, and voiceovers

## Technology Stack

### Frontend
- React 18+ with TypeScript
- Chakra UI for component library (dark mode enabled)
- Redux Toolkit for state management
- React Router for navigation
- Firebase Authentication and Firestore integration

### Backend
- Python FastAPI
- Firebase Admin SDK
- Asynchronous task processing with Celery
- Integration with external AI services

### External Services
- OpenAI API for text generation
- GoAPI for access to:
  - Midjourney (image generation)
  - Kling (video generation)
  - Udio (audio generation)

## Repository Structure

```
/frontend       # React application
  /src          # Frontend source code
    /components # Reusable UI components
    /pages      # Main application pages
    /features   # Redux slices and logic
    /services   # API and external services
    /hooks      # Custom React hooks
    /theme      # Chakra UI theme customization

/backend        # FastAPI application
  /app          # Backend source code
    /api        # API endpoints
    /models     # Data models
    /services   # External service integrations
    /core       # Core functionality and config

/docs           # Project documentation
```

## Getting Started

### Prerequisites
- Node.js 16+ and npm
- Python 3.9+
- Firebase account with Firestore and Authentication enabled
- API keys for OpenAI and GoAPI

### Setup Instructions

1. Clone the repository
```bash
git clone https://github.com/Mzanuso/ai-content-creator.git
cd ai-content-creator
```

2. Set up environment variables according to the documentation in `docs/environment_setup.md`

3. Start the frontend
```bash
cd frontend
npm install
npm start
```

4. Start the backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Development Roadmap

See `docs/project_roadmap.md` for detailed information on the development phases.

## Project Workflow

See `docs/workflow.md` for detailed information on the user journey and application workflow.

## API Design

See `docs/api_design.md` for information on API endpoints and data models.

## Architecture

See `docs/architecture.md` for details on the system architecture and component interaction.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by advancements in generative AI for content creation
- Built with modern web technologies and best practices