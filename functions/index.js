const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const express = require('express');
const axios = require('axios');

admin.initializeApp();

const app = express();
app.use(cors);

// API per gestione progetti
app.get('/api/projects', async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: 'userId è richiesto' });
    }

    const projectsRef = admin.firestore().collection('projects');
    const snapshot = await projectsRef.where('userId', '==', userId).get();

    const projects = [];
    snapshot.forEach(doc => {
      projects.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return res.status(200).json(projects);
  } catch (error) {
    console.error('Errore nel recupero progetti:', error);
    return res.status(500).json({ error: 'Errore interno del server' });
  }
});

// API per creazione progetto
app.post('/api/projects', async (req, res) => {
  try {
    const { userId, title, description } = req.body;
    
    if (!userId || !title) {
      return res.status(400).json({ error: 'userId e title sono richiesti' });
    }

    const projectData = {
      userId,
      title,
      description: description || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'draft'
    };

    const docRef = await admin.firestore().collection('projects').add(projectData);
    
    return res.status(201).json({
      id: docRef.id,
      ...projectData
    });
  } catch (error) {
    console.error('Errore nella creazione progetto:', error);
    return res.status(500).json({ error: 'Errore interno del server' });
  }
});

// Altre API verranno implementate qui...

exports.api = functions.https.onRequest(app);

// Funzione per gestire la creazione utente
exports.createUserProfile = functions.auth.user().onCreate(async (user) => {
  try {
    const userProfile = {
      email: user.email,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      subscription: 'free',
      credits: 10
    };

    await admin.firestore().collection('users').doc(user.uid).set(userProfile);
    
    console.log(`Profilo utente creato per ${user.uid}`);
    return null;
  } catch (error) {
    console.error('Errore nella creazione profilo utente:', error);
    return null;
  }
});
