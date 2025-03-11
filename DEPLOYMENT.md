# Deployment Guide for AI Content Creator

This document outlines how to properly set up and deploy the AI Content Creator platform using Firebase and GitHub Actions.

## Prerequisites

- Node.js 18 or higher
- Firebase account with a project created
- GitHub account with access to this repository

## Local Setup

1. Clone the repository:
   ```
   git clone https://github.com/Mzanuso/ai-content-creator.git
   cd ai-content-creator
   ```

2. Install dependencies:
   ```
   npm install
   cd frontend && npm install
   cd ../functions && npm install
   ```

3. Set up Firebase locally:
   ```
   npm install -g firebase-tools
   firebase login
   firebase use ai-content-creator-f7d53
   ```

4. Run the development environment:
   ```
   # In one terminal for frontend
   cd frontend
   npm start

   # In another terminal for functions
   cd functions
   npm run serve
   ```

## Firebase Configuration

1. Create a Firebase project if you haven't already
2. Update `.firebaserc` with your project ID:
   ```json
   {
     "projects": {
       "default": "your-project-id"
     }
   }
   ```
3. Update the `projectId` in the GitHub Actions workflow file (`.github/workflows/firebase-deploy.yml`)

## GitHub Secrets Setup for CI/CD

1. Go to Firebase Console > Project Settings > Service accounts
2. Generate a new private key (JSON format)
3. In GitHub, go to your repository > Settings > Secrets and variables > Actions
4. Create a new secret:
   - Name: `FIREBASE_SERVICE_ACCOUNT_AI_CONTENT_CREATOR_F7D53` (replace with your project ID format)
   - Value: Paste the entire JSON content of the service account key

## Manual Deployment

If you prefer to deploy manually:

1. Build the frontend:
   ```
   cd frontend
   npm run build
   ```

2. Deploy to Firebase:
   ```
   firebase deploy
   ```

## Troubleshooting

### Common Deployment Issues

1. **Build Failures**: Make sure all dependencies are correctly installed and the build process works locally.
2. **Authentication Errors**: Check that your Firebase service account is correctly set up in GitHub Secrets.
3. **Project ID Mismatch**: Ensure the project ID is consistent across all configuration files.

### Useful Commands

- Check Firebase project: `firebase projects:list`
- Validate Firebase config: `firebase apps:sdkconfig`
- View deployment logs: `firebase deploy --debug`

## Security Best Practices

1. Never commit Firebase service account keys to the repository
2. Use environment variables for sensitive information
3. Set proper security rules in `firestore.rules` and `storage.rules`
