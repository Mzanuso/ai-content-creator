# Frontend di AI Content Creator

Questa cartella contiene l'applicazione frontend di AI Content Creator, creata con React.

## Istruzioni per lo sviluppo

### Prerequisiti
- Node.js 16.x
- npm 8.x

### Installazione
```bash
npm install --legacy-peer-deps
```

### Avvio in modalità sviluppo
```bash
npm start
```

### Build per produzione
```bash
npm run build
```

## Note importanti per lo sviluppo

### Package Lock
Il sistema di build di Firebase App Hosting utilizza `npm ci` che richiede un package-lock.json sincronizzato con package.json. Se aggiungi nuove dipendenze, assicurati di:

1. Eseguire `npm install --package-lock-only` per aggiornare il package-lock.json
2. Committare sia package.json che package-lock.json insieme

In alternativa, se stai avendo problemi con il build, puoi:

1. Eliminare il file package-lock.json
2. Eseguire `npm install --legacy-peer-deps` per rigenerarlo completamente
3. Committare il nuovo package-lock.json

### Dipendenze React
Questo progetto utilizza React 18 con TypeScript. Quando aggiungi nuove dipendenze, testa sempre il build in locale eseguendo:

```bash
npm run build
```

Per problemi con ajv o ajv-keywords, abbiamo aggiunto una sezione `resolutions` in package.json per forzare versioni specifiche.
