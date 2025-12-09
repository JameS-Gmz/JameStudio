const express = require('express');
const router = express.Router();
const db = require('../config/database');
const asyncHandler = require('../middleware/asyncHandler');
const Logger = require('../config/logger');
const upload = require('../config/upload');

// Upload d'un fichier, optionnellement lié à un projet
router.post('/upload/file', upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Aucun fichier fourni' });
  }

  const projectId = req.body.projectId;
  const fileUrl = `/uploads/${req.file.filename}`;

  if (projectId) {
    try {
      const project = await db.getProjectById(projectId);
      if (!project) {
        return res.json({ 
          fileUrl, 
          message: 'Fichier uploadé (projet non trouvé)' 
        });
      }
      
      await db.updateProjectImageUrl(projectId, fileUrl);
      res.json({ 
        fileUrl, 
        message: 'Fichier uploadé et projet mis à jour' 
      });
    } catch (error) {
      Logger.error('Erreur lors de la mise à jour du projet:', error);
      res.json({ 
        fileUrl, 
        message: 'Fichier uploadé (erreur lors de la mise à jour du projet)' 
      });
    }
  } else {
    res.json({ fileUrl, message: 'Fichier uploadé avec succès' });
  }
}));

// Récupère l'image d'un projet
router.get('/image/:projectId', asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const imageUrl = await db.getProjectImageUrl(projectId);
  
  if (!imageUrl || imageUrl.trim() === '' || imageUrl === 'null') {
    return res.json({ fileUrl: null });
  }
  
  res.json({ fileUrl: imageUrl });
}));

module.exports = router;

