const express = require('express');
const router = express.Router();
const upload = require('../config/upload');
const asyncHandler = require('express-async-handler');
const db = require('../config/database');
const Logger = require('../config/logger');
const cors = require('cors');

// --- Préflight OPTIONS pour le upload ---
router.options('/upload/file', cors());

router.post('/upload/file', cors(), upload.single('file'), asyncHandler(async (req, res) => {
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
      
      // Ajouter l'image au tableau images au lieu d'écraser imageUrl
      const result = await db.addProjectImage(projectId, fileUrl);
      res.json({ 
        fileUrl, 
        images: result.images,
        imageUrl: result.imageUrl,
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

// GET récupérer l'URL de l'image principale d'un projet
router.get('/image/:projectId', cors(), asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  
  try {
    // Vérifier d'abord si le projet existe
    const project = await db.getProjectById(projectId);
    
    if (!project) {
      return res.status(404).json({ 
        error: 'Projet non trouvé',
        projectId: parseInt(projectId)
      });
    }
    
    // Récupérer l'URL de l'image principale
    const imageUrl = await db.getProjectImageUrl(projectId);
    
    if (!imageUrl) {
      return res.status(404).json({ 
        error: 'Image non trouvée pour ce projet',
        projectId: parseInt(projectId)
      });
    }
    
    res.json({ imageUrl, projectId: parseInt(projectId) });
  } catch (error) {
    Logger.error(`Erreur lors de la récupération de l'image du projet ${projectId}:`, error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération de l\'image',
      projectId: parseInt(projectId)
    });
  }
}));

// GET récupérer toutes les images d'un projet
router.get('/images/:projectId', cors(), asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  
  try {
    // Vérifier d'abord si le projet existe
    const project = await db.getProjectById(projectId);
    
    if (!project) {
      return res.status(404).json({ 
        error: 'Projet non trouvé',
        projectId: parseInt(projectId)
      });
    }
    
    // Récupérer toutes les images
    const images = project.images || [];
    const imageUrl = project.imageUrl || null;
    
    res.json({ 
      imageUrl, 
      images,
      projectId: parseInt(projectId) 
    });
  } catch (error) {
    Logger.error(`Erreur lors de la récupération des images du projet ${projectId}:`, error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des images',
      projectId: parseInt(projectId)
    });
  }
}));

module.exports = router;
