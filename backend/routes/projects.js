const express = require('express');
const router = express.Router();
const db = require('../config/database');
const asyncHandler = require('../middleware/asyncHandler');
const Logger = require('../config/logger');

// GET tous les projets
router.get('/', asyncHandler(async (req, res) => {
  const projects = await db.getAllProjects();
  res.json(projects);
}));

// GET projet par ID
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const project = await db.getProjectById(id);
  
  if (!project) {
    return res.status(404).json({ error: 'Projet non trouvé' });
  }
  
  res.json(project);
}));

// POST créer un projet
router.post('/', asyncHandler(async (req, res) => {
  const { title, description, imageUrl } = req.body;
  
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Le titre est requis' });
  }

  const project = await db.createProject({ title, description, imageUrl });
  res.status(201).json(project);
}));

// PUT mettre à jour un projet
router.put('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, imageUrl } = req.body;
  
  const project = await db.updateProject(id, { title, description, imageUrl });
  res.json(project);
}));

// DELETE supprimer un projet
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  await db.deleteProject(id);
  res.json({ message: 'Projet supprimé' });
}));

module.exports = router;

