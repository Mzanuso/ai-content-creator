# Guida Completa per Sviluppatori

Questo documento fornisce una guida dettagliata per lo sviluppo dell'applicazione AI Content Creator, spiegando la struttura del progetto, il processo di build e le best practices.

## Struttura del Progetto

Il progetto è organizzato in diverse cartelle principali:

```
ai-content-creator/
├── frontend/         # Applicazione React
├── backend/          # API FastAPI
├── functions/        # Firebase Cloud Functions
├── docs/             # Documentazione
├── scripts/          # Script di supporto
└── .github/          # Configurazioni GitHub Actions
```

### Frontend (React + TypeScript)

- **src/components/** - Componenti UI riutilizzabili
- **src/features/** - Funzionalità specifiche organizzate per dominio
- **src/services/** - Servizi per interagire con API esterne e Firebase
- **src/hooks/** - Custom React hooks
- **src/pages/** - Componenti pagina
- **src/theme/** - Configurazione del tema Chakra UI

### Backend (FastAPI + Python)

- **app/api/** - Endpoints API
- **app/core/** - Configurazioni e utilities
- **app/models/** - Modelli di dati
- **app/schemas/** - Schemi Pydantic
- **app/services/** - Servizi business logic e integrazione con API esterne

## Ambiente di Sviluppo

### Prerequisiti

- Node.js v16.x
- npm v8.x
- Python 3.8+
- Firebase CLI

### Setup Iniziale

1. **Clone del repository**:
   ```bash
   git clone https://github.com/Mzanuso/ai-content-creator.git
   cd ai-content-creator
   ```

2. **Installazione dipendenze**:
   ```bash
   # Dipendenze principali
   npm install
   
   # Frontend
   cd frontend
   npm install --legacy-peer-deps
   
   # Backend
   cd ../backend
   pip install -r requirements.txt
   ```

3. **Configurazione variabili d'ambiente**:
   - Copia `.env.example` in `.env` sia nella cartella frontend che backend
   - Inserisci le chiavi API necessarie (Firebase, OpenAI, GoAPI)

## Processo di Build

### Frontend

Per avviare il server di sviluppo:
```bash
cd frontend
npm start
```

Per creare una build di produzione:
```bash
cd frontend
npm run build
```

**Nota importante**: Il processo di build utilizza le seguenti variabili d'ambiente:
- `CI=false` - Previene che gli avvisi vengano trattati come errori
- `DISABLE_ESLINT_PLUGIN=true` - Disabilita il controllo ESLint durante la build
- `GENERATE_SOURCEMAP=false` - Riduce le dimensioni della build

### Backend

Per avviare il server di sviluppo:
```bash
cd backend
uvicorn app.main:app --reload
```

## Risoluzione problemi comuni

### Problemi di build frontend

#### 1. Errori con `ajv` e `ajv-keywords`

Questi pacchetti possono causare problemi di compatibilità. Assicurati di utilizzare:
- `ajv`: versione 8.12.0
- `ajv-keywords`: versione 5.1.0

Se persiste il problema:
```bash
cd frontend
rm -rf node_modules
rm package-lock.json
npm cache clean --force
npm install --legacy-peer-deps
```

#### 2. Errori di memoria durante la build

Configura Node.js con più memoria:
```bash
export NODE_OPTIONS=--max-old-space-size=4096
```

#### 3. Errori di compatibilità TypeScript

Se riscontri errori TypeScript, verificare che tsconfig.json sia configurato correttamente e che sia impostato `"downlevelIteration": true`.

### Problemi di Firebase

#### 1. Errori di autenticazione

- Verifica che `firebase.ts` contenga le corrette configurazioni del progetto
- Controlla che tutti i domini siano aggiunti nelle impostazioni Authentication

#### 2. Errori di deployment

- Assicurati che `.firebaserc` punti al progetto corretto
- Verifica che le regole di sicurezza in `firestore.rules` e `storage.rules` siano configurate correttamente

## Best Practices

### Stile di codice

1. **Frontend**:
   - Usa componenti funzionali con React Hooks
   - Segui il pattern di file unici per componente
   - Usa TypeScript per type safety

2. **Backend**:
   - Segui le convenzioni PEP 8
   - Usa tipizzazione statica dove possibile
   - Organizza il codice seguendo il pattern repository/service

### Gestione delle dipendenze

- Evita l'installazione di pacchetti non necessari
- Specifica sempre le versioni esatte per dipendenze critiche
- Risolvi i conflitti di pacchetti usando `resolutions` in package.json

### Sicurezza

- **NON** committare mai chiavi API o credenziali nei file sorgente
- Usa sempre variabili d'ambiente per configurazioni sensibili
- Attieniti alle regole di sicurezza Firebase per controllo accessi

## Workflow di Deployment

Il progetto utilizza GitHub Actions per CD/CI. Il workflow principale:

1. Il codice viene pushato al branch `main`
2. GitHub Actions esegue:
   - Installazione dipendenze
   - Build del frontend
   - Esecuzione dei test (quando configurati)
   - Deployment su Firebase Hosting e Functions

Per ulteriori dettagli, consulta il file `.github/workflows/firebase-deploy.yml`.

## Risorse aggiuntive

- [Documentazione Firebase](https://firebase.google.com/docs)
- [Documentazione React](https://reactjs.org/docs/getting-started.html)
- [Documentazione FastAPI](https://fastapi.tiangolo.com/)
- [Documentazione Chakra UI](https://chakra-ui.com/docs/getting-started)
- [Documentazione OpenAI API](https://platform.openai.com/docs/)