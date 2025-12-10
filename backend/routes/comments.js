const express = require('express');
const router = express.Router();
const db = require('../config/database');
const asyncHandler = require('express-async-handler');
const Logger = require('../config/logger');
const cors = require('cors');

// GET tous les commentaires d'un projet avec statistiques
router.get('/project/:projectId', cors(), asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  
  try {
    const comments = await db.getCommentsByProjectId(projectId);
    
    // Calculer les statistiques comme le frontend les attend
    const ratings = comments
      .filter(c => c.rating !== null && c.rating !== undefined)
      .map(c => c.rating);
    
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
      : 0;
    
    const totalComments = comments.length;
    const totalRatings = ratings.length;
    
    // Formater les commentaires pour correspondre au modèle frontend
    const formattedComments = comments.map(c => ({
      id: c.id,
      projectId: c.projectId,
      content: c.content,
      rating: c.rating,
      email: c.email,
      authorName: c.authorName || c.author,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt
    }));
    
    res.json({
      comments: formattedComments,
      averageRating: Math.round(averageRating * 10) / 10,
      totalComments,
      totalRatings
    });
  } catch (error) {
    Logger.error(`Erreur lors de la récupération des commentaires du projet ${projectId}:`, error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des commentaires',
      projectId: parseInt(projectId)
    });
  }
}));

// GET tous les commentaires
router.get('/', cors(), asyncHandler(async (req, res) => {
  try {
    const comments = await db.getAllComments();
    res.json(comments);
  } catch (error) {
    Logger.error('Erreur lors de la récupération des commentaires:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des commentaires' });
  }
}));

// GET un commentaire par ID
router.get('/:id', cors(), asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  try {
    const comment = await db.getCommentById(id);
    
    if (!comment) {
      return res.status(404).json({ 
        error: 'Commentaire non trouvé',
        id: parseInt(id)
      });
    }
    
    res.json(comment);
  } catch (error) {
    Logger.error(`Erreur lors de la récupération du commentaire ${id}:`, error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération du commentaire',
      id: parseInt(id)
    });
  }
}));

// POST créer un commentaire
router.post('/', cors(), asyncHandler(async (req, res) => {
  const { projectId, author, authorName, content, rating, email } = req.body;
  
  // Validation de l'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    return res.status(400).json({ 
      error: 'Email invalide' 
    });
  }
  
  if (!projectId || !author) {
    return res.status(400).json({ 
      error: 'projectId et author sont requis' 
    });
  }

  if (!content?.trim() && !rating) {
    return res.status(400).json({ 
      error: 'Veuillez ajouter un commentaire ou une note' 
    });
  }

  try {
    // Vérifier que le projet existe
    const project = await db.getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ 
        error: 'Projet non trouvé',
        projectId: parseInt(projectId)
      });
    }

    const comment = await db.createComment({
      projectId,
      author,
      authorName: authorName || author,
      content: content?.trim() || null,
      rating: rating || null,
      email: email.toLowerCase().trim()
    });
    
    // Formater la réponse pour correspondre au modèle frontend
    const formattedComment = {
      id: comment.id,
      projectId: comment.projectId,
      content: comment.content,
      rating: comment.rating,
      email: comment.email,
      authorName: comment.authorName || comment.author,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt
    };
    
    res.status(201).json(formattedComment);
  } catch (error) {
    Logger.error('Erreur lors de la création du commentaire:', error);
    res.status(500).json({ error: 'Erreur lors de la création du commentaire' });
  }
}));

// PUT mettre à jour un commentaire
router.put('/:id', cors(), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { author, authorName, content, rating, email } = req.body;
  
  // Validation de l'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    return res.status(400).json({ 
      error: 'Email invalide' 
    });
  }
  
  try {
    // Vérifier que le commentaire existe et que l'email correspond
    const existingComment = await db.getCommentById(id);
    if (!existingComment) {
      return res.status(404).json({ 
        error: 'Commentaire non trouvé',
        id: parseInt(id)
      });
    }
    
    if (existingComment.email?.toLowerCase() !== email.toLowerCase()) {
      return res.status(403).json({ 
        error: 'Vous ne pouvez modifier que vos propres commentaires' 
      });
    }
    
    const comment = await db.updateComment(id, {
      author,
      authorName,
      content: content?.trim() || null,
      rating: rating || null,
      email: email.toLowerCase().trim()
    });
    
    // Formater la réponse pour correspondre au modèle frontend
    const formattedComment = {
      id: comment.id,
      projectId: comment.projectId,
      content: comment.content,
      rating: comment.rating,
      email: comment.email,
      authorName: comment.authorName || comment.author,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt
    };
    
    res.json(formattedComment);
  } catch (error) {
    if (error.message === 'Comment not found') {
      return res.status(404).json({ 
        error: 'Commentaire non trouvé',
        id: parseInt(id)
      });
    }
    Logger.error(`Erreur lors de la mise à jour du commentaire ${id}:`, error);
    res.status(500).json({ 
      error: 'Erreur lors de la mise à jour du commentaire',
      id: parseInt(id)
    });
  }
}));

// DELETE supprimer un commentaire
router.delete('/:id', cors(), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { email } = req.body; // Email dans le body pour vérification
  
  // Validation de l'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    return res.status(400).json({ 
      error: 'Email invalide' 
    });
  }
  
  try {
    // Vérifier que le commentaire existe et que l'email correspond
    const existingComment = await db.getCommentById(id);
    if (!existingComment) {
      return res.status(404).json({ 
        error: 'Commentaire non trouvé',
        id: parseInt(id)
      });
    }
    
    if (existingComment.email?.toLowerCase() !== email.toLowerCase()) {
      return res.status(403).json({ 
        error: 'Vous ne pouvez supprimer que vos propres commentaires' 
      });
    }
    
    await db.deleteComment(id);
    res.json({ message: 'Commentaire supprimé' });
  } catch (error) {
    if (error.message === 'Comment not found') {
      return res.status(404).json({ 
        error: 'Commentaire non trouvé',
        id: parseInt(id)
      });
    }
    Logger.error(`Erreur lors de la suppression du commentaire ${id}:`, error);
    res.status(500).json({ 
      error: 'Erreur lors de la suppression du commentaire',
      id: parseInt(id)
    });
  }
}));

module.exports = router;

