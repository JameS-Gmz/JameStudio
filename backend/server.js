// Serveur API pour James Studio
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');

const db = require('./config/database');
const Logger = require('./config/logger');
const errorHandler = require('./middleware/errorHandler');
const upload = require('./config/upload');

const projectsRoutes = require('./routes/projects');
const filesRoutes = require('./routes/files');
const healthRoutes = require('./routes/health');

const app = express();
const PORT = process.env.PORT || 9091;

// Middleware principaux
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Préparer le dossier uploads
const uploadsDir = path.join(__dirname, 'uploads');
fs.ensureDirSync(uploadsDir);

// Routes
app.use('/api/projects', projectsRoutes);
app.use('/game', filesRoutes);
app.use('/health', healthRoutes);

// Sert les fichiers uploadés (support vidéo de base)
app.use('/uploads', express.static(uploadsDir, {
  setHeaders: (res, filePath) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Accept-Ranges', 'bytes');
    if (filePath.endsWith('.mp4')) {
      res.setHeader('Content-Type', 'video/mp4');
    }
  }
}));

// Middleware de gestion d'erreur (doit être en dernier)
app.use(errorHandler);

// Initialiser la base de données et démarrer le serveur
async function startServer() {
  try {
    await db.connect();
    Logger.info('Base de données connectée');
    
    app.listen(PORT, () => {
      Logger.info(`🚀 Serveur sur http://localhost:${PORT}`);
    });
  } catch (error) {
    Logger.error('Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
}

// Gestion propre de l'arrêt
process.on('SIGINT', async () => {
  Logger.info('Arrêt du serveur...');
  await db.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  Logger.info('Arrêt du serveur...');
  await db.close();
  process.exit(0);
});

startServer();
