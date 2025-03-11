const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const axios = require('axios');

admin.initializeApp();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Configurazione delle chiavi API
const OPENAI_API_KEY = functions.config().openai?.key || '';
const GOAPI_API_KEY = functions.config().goapi?.key || '';

// Test endpoint
app.get('/v1/test', (req, res) => {
  res.json({ message: 'API funzionante!' });
});

// OpenAI endpoint
app.post('/v1/ai/writer/generate-screenplay', async (req, res) => {
  try {
    const { concept, targetDuration, styleDescription } = req.body;
    
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-4o-mini",
      store: true,
      messages: [
        { 
          "role": "system", 
          "content": `You are an expert screenplay writer specializing in short-form video content.
          Create a 5-part screenplay for a video of approximately ${targetDuration || '60'} seconds.
          Style reference: ${styleDescription || 'modern and professional'}`
        },
        { "role": "user", "content": concept || "Create a product explainer video" }
      ]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      }
    });
    
    res.json({ 
      screenplay: {
        concept: concept,
        sections: [
          { id: "1", text: response.data.choices[0].message.content, order: 1 }
        ]
      }
    });
  } catch (error) {
    console.error('OpenAI API error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate screenplay' });
  }
});

// Endpoint per i progetti
app.get('/v1/projects', async (req, res) => {
  try {
    const userId = req.headers.authorization?.split('Bearer ')[1];
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const projectsSnapshot = await admin.firestore()
      .collection('projects')
      .where('userId', '==', userId)
      .get();
    
    const projects = [];
    projectsSnapshot.forEach(doc => {
      projects.push({ id: doc.id, ...doc.data() });
    });
    
    res.json({ projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Endpoint per gli stili
app.get('/v1/styles', async (req, res) => {
  try {
    const stylesSnapshot = await admin.firestore()
      .collection('styles')
      .get();
    
    const styles = [];
    stylesSnapshot.forEach(doc => {
      styles.push({ srefCode: doc.id, ...doc.data() });
    });
    
    res.json({ styles });
  } catch (error) {
    console.error('Error fetching styles:', error);
    res.status(500).json({ error: 'Failed to fetch styles' });
  }
});

// Esporta l'app Express come funzione Cloud
exports.api = functions.https.onRequest(app);