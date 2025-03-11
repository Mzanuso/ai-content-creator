# Istruzioni di Deployment

Questo documento fornisce le istruzioni per il deployment dell'applicazione AI Content Creator sia in ambiente di sviluppo che di produzione.

## Prerequisiti

- Node.js 16.x e npm 8.x
- Python 3.8+ e pip
- Account Firebase con progetto configurato
- Firebase CLI installato e configurato
- Accesso alle API: OpenAI e GoAPI

## Configurazione dell'ambiente

### 1. Configurazione Firebase

1. Crea un nuovo progetto Firebase se non ne hai già uno
2. Abilita Authentication con Google e Email/Password
3. Configura Firestore Database
4. Configura Storage
5. Configura Hosting
6. Genera un Service Account per l'accesso backend

### 2. Configurazione delle variabili d'ambiente

**Frontend (.env)**
```
REACT_APP_FIREBASE_API_KEY=AIzaSyAh6QO0rj3Fipyoc1pJ5UTWeS_S-HLzftM
REACT_APP_FIREBASE_AUTH_DOMAIN=ai-content-creator-f7d53.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=ai-content-creator-f7d53
REACT_APP_FIREBASE_STORAGE_BUCKET=ai-content-creator-f7d53.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=608058888070
REACT_APP_FIREBASE_APP_ID=1:608058888070:web:c9ff5462de964fa84a2607
REACT_APP_FIREBASE_MEASUREMENT_ID=G-BL3NB5HWQ0
REACT_APP_API_URL=http://localhost:8000/api/v1
```

**Backend (.env)**
```
# Firebase Configuration
FIREBASE_PROJECT_ID=ai-content-creator-f7d53
FIREBASE_SERVICE_ACCOUNT_PATH=path/to/service-account.json

# API Keys
OPENAI_API_KEY=your_openai_api_key
GOAPI_API_KEY=your_goapi_key

# Security
SECRET_KEY=generate_a_secure_random_key

# Redis Configuration (se applicabile)
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Deployment in sviluppo

### Frontend

```bash
cd frontend
npm install --legacy-peer-deps
npm start
```

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Deployment in produzione

### Utilizzo di GitHub Actions (CI/CD)

Il repository è configurato con GitHub Actions per il deployment automatico:

1. Configura i seguenti segreti nel repository GitHub:
   - `FIREBASE_TOKEN`: Token di accesso Firebase
   - `FIREBASE_SERVICE_ACCOUNT_AI_CONTENT_CREATOR_F7D53`: JSON del service account

2. Ogni push al branch `main` attiverà automaticamente il workflow di deployment

### Deployment manuale

```bash
# Build del frontend
cd frontend
npm install --legacy-peer-deps
npm run build

# Build e deploy su Firebase
firebase deploy
```

## Risoluzione problemi comuni

### Errori di build del frontend

- Se ci sono problemi con `ajv` o `ajv-keywords`, assicurati di usare versioni compatibili (8.12.0 e 5.1.0)
- Se ci sono problemi con React, prova a usare `--legacy-peer-deps` durante l'installazione
- Per problemi di memoria durante la build, usa `NODE_OPTIONS=--max-old-space-size=4096`

### Errori di autenticazione Firebase

- Verifica che le chiavi API siano corrette e che il progetto sia correttamente configurato
- Controlla che i domini siano aggiunti nelle impostazioni di autenticazione Firebase

### Errori del backend

- Verifica che il service account abbia i permessi corretti
- Assicurati che le API keys siano valide e attive
