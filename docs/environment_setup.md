# Environment Setup Guide

This guide explains how to set up the environment variables needed for both the frontend and backend of the AI Content Creator application.

## Backend Setup (.env)

1. Copy the `.env.example` file to a new file named `.env` in the backend directory
2. Fill in the following values:

### Firebase Configuration
- `FIREBASE_PROJECT_ID`: Set to "video-content-creator-4bb16"
- `FIREBASE_SERVICE_ACCOUNT`: Path to your Firebase service account JSON file

### API Keys
From the GOAPI_KEY.txt file:
- `OPENAI_API_KEY`: Copy the OpenAI API key from the GOAPI_KEY.txt file
- `GOAPI_API_KEY`: Copy the GoAPI key from the GOAPI_KEY.txt file

### Security
- `SECRET_KEY`: Generate a random secure string (you can use an online generator)

### Redis Configuration
- `REDIS_HOST`: Set to "localhost" unless using a different Redis server
- `REDIS_PORT`: Set to "6379" unless using a different port

## Frontend Setup (.env)

1. Copy the `.env.example` file to a new file named `.env` in the frontend directory
2. Verify the following values:

### Firebase Configuration
All values should be filled with information found in the 'Add Firebase SDK.txt' file:
- `REACT_APP_FIREBASE_API_KEY`: From the Firebase config
- `REACT_APP_FIREBASE_AUTH_DOMAIN`: From the Firebase config
- `REACT_APP_FIREBASE_PROJECT_ID`: From the Firebase config
- `REACT_APP_FIREBASE_STORAGE_BUCKET`: From the Firebase config
- `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`: From the Firebase config
- `REACT_APP_FIREBASE_APP_ID`: From the Firebase config
- `REACT_APP_FIREBASE_MEASUREMENT_ID`: From the Firebase config

### API Configuration
- `REACT_APP_API_URL`: Set to the backend API URL (default: "http://localhost:8000/api/v1")

## Important Security Notes

1. **Never commit your .env files to version control**
2. **Keep your API keys secure and don't share them publicly**
3. **Rotate your keys periodically for better security**
4. **Consider using a secrets management solution for production environments**
