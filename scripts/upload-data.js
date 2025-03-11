const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Percorso al file service account che hai scaricato
const serviceAccountPath = process.argv[2] || './service-account.json';

if (!fs.existsSync(serviceAccountPath)) {
  console.error(`File non trovato: ${serviceAccountPath}`);
  console.error('Usa: node upload-data.js [percorso-al-service-account.json]');
  process.exit(1);
}

const serviceAccount = require(path.resolve(serviceAccountPath));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const storage = admin.storage();

// Stili di base per l'app
const styles = [
  {
    srefCode: "modern_minimal",
    name: "Modern Minimal",
    description: "Clean, minimalist aesthetic with ample white space",
    palette: ["#FFFFFF", "#000000", "#E63946"],
    keywords: ["minimal", "modern", "clean"],
    category: "corporate",
    previewUrl: "/styles/previews/modern_minimal.jpg"
  },
  {
    srefCode: "vibrant_creative",
    name: "Vibrant Creative",
    description: "Bold colors and dynamic compositions",
    palette: ["#3A86FF", "#FF006E", "#FFBE0B"],
    keywords: ["vibrant", "creative", "bold"],
    category: "creative",
    previewUrl: "/styles/previews/vibrant_creative.jpg"
  },
  {
    srefCode: "tech_futuristic",
    name: "Tech Futuristic",
    description: "High-tech aesthetic with futuristic elements",
    palette: ["#0B0C10", "#1F2833", "#66FCF1"],
    keywords: ["tech", "futuristic", "digital"],
    category: "technology",
    previewUrl: "/styles/previews/tech_futuristic.jpg"
  }
];

async function uploadData() {
  try {
    console.log('Caricamento stili in Firestore...');
    
    // Carica stili in Firestore
    const batch = db.batch();
    
    for (const style of styles) {
      const docRef = db.collection('styles').doc(style.srefCode);
      batch.set(docRef, style);
    }
    
    await batch.commit();
    console.log('Stili caricati con successo!');
    
    process.exit(0);
  } catch (error) {
    console.error('Errore durante il caricamento dei dati:', error);
    process.exit(1);
  }
}

uploadData();