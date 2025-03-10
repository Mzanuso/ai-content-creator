# Development Guide

This document provides guidance for developers working on the AI Content Creator project.

## Development Process

### Version Control

1. **Branch Strategy**
   - `main` - The production branch, should always be stable
   - `develop` - Development branch for integration
   - Feature branches - Named as `feature/feature-name` for new features
   - Bug fix branches - Named as `fix/bug-name` for bug fixes

2. **Commit Guidelines**
   - Write clear, concise commit messages
   - Use prefixes like `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, etc.
   - Reference issue numbers when applicable

3. **Pull Request Process**
   - Create PRs against the `develop` branch
   - Include a description of changes and reference related issues
   - Ensure tests pass before requesting review
   - Request review from at least one team member

### Coding Standards

#### Frontend (React/TypeScript)

1. **General Guidelines**
   - Use functional components with hooks
   - Maintain type safety with TypeScript
   - Use absolute imports with path aliases
   - Follow the component structure in the repository

2. **State Management**
   - Use Redux for global state
   - Use local state (useState) for component-specific state
   - Create selectors for accessing Redux state

3. **Styling**
   - Use Chakra UI components for consistent design
   - Follow the theme configuration in `src/theme`
   - Ensure mobile responsiveness

#### Backend (Python/FastAPI)

1. **General Guidelines**
   - Follow PEP 8 style guide
   - Use type hints for function parameters and return values
   - Document functions and classes with docstrings

2. **API Design**
   - Follow RESTful principles
   - Use Pydantic models for request/response validation
   - Implement proper error handling

3. **Database Access**
   - Use Firebase Admin SDK for Firestore operations
   - Create service functions for database access
   - Implement proper error handling and logging

## Development Environment Setup

### Frontend Development

1. **Installation**
```bash
cd frontend
npm install
```

2. **Development Server**
```bash
npm start
```

3. **Linting**
```bash
npm run lint
```

4. **Testing**
```bash
npm test
```

5. **Building for Production**
```bash
npm run build
```

### Backend Development

1. **Virtual Environment**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Running Development Server**
```bash
uvicorn app.main:app --reload
```

3. **Testing**
```bash
pytest
```

## Module Development Guidelines

### Adding a New Feature Module

1. **Frontend**
   - Create a new slice in `src/features` if needed
   - Add necessary components in `src/components`
   - Update routes if necessary
   - Add the new page in `src/pages`

2. **Backend**
   - Add new endpoints in `app/api`
   - Create models in `app/models` if needed
   - Implement service functions in `app/services`
   - Update API documentation

### AI Integration Guidelines

1. **OpenAI Integration**
   - Use the OpenAI service in `backend/app/services`
   - Handle rate limiting and errors appropriately
   - Keep prompts as configurable as possible

2. **GoAPI Integration**
   - Follow the documentation for Midjourney, Kling, and Udio
   - Implement proper error handling
   - Cache responses when appropriate

## Deployment

### Development Deployment

The application can be deployed to Replit for development purposes:

1. Link GitHub repository to Replit
2. Configure environment variables
3. Start the application with the appropriate commands

### Production Deployment

For production, consider using:

1. Frontend: Vercel, Netlify, or Firebase Hosting
2. Backend: Cloud Run, Cloud Functions, or a dedicated server

## Troubleshooting

### Common Issues

1. **API Keys not working**
   - Check environment variables
   - Verify API key permissions
   - Check for rate limiting

2. **Frontend build errors**
   - Check for TypeScript type errors
   - Verify import paths
   - Check for missing dependencies

3. **Backend errors**
   - Check logs for detailed error messages
   - Verify Firebase configuration
   - Check API endpoint URLs and parameters

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Chakra UI Documentation](https://chakra-ui.com/docs/getting-started)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/introduction/getting-started)
- [Firebase Documentation](https://firebase.google.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs/)