const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');
const { validateProject } = require('../middleware/validate');
const auth = require('../middleware/auth');

// 1. Lister MES projets (protégé : chacun ne voit que les siens)
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.findAll({ where: { UserId: req.userId } });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des projets' });
  }
});

// 2. Récupérer UN DE MES projets, avec ses tâches (protégé + vérifie l'appartenance)
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      where: { id: req.params.id, UserId: req.userId },
      include: [Task] // "Joins" automatiquement les tâches associées
    });

    if (!project) {
        return res.status(404).json({ error: 'Projet introuvable' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

//3. Route pour créer un projet (POST)
router.post('/', auth, validateProject, async (req, res) => {
  try {
    const { name, description } = req.body;
    const newProject = await Project.create({ name, description, UserId: req.userId });
    res.status(201).json(newProject);
  } catch (error) {
    res.status(400).json({ error: 'Erreur lors de la création du projet' });
  }
});

// 4. Ajouter une tâche à UN DE MES projets (protégé + vérifie l'appartenance)
router.post('/:projectId/tasks', auth, async (req, res) => {
  try {
    const project = await Project.findOne({ where: { id: req.params.projectId, UserId: req.userId } });
    if (!project) {
      return res.status(404).json({ error: 'Projet introuvable' });
    }
    const { title } = req.body;
    const newTask = await Task.create({ title, ProjectId: project.id });
    res.status(201).json(newTask);
  } catch (error) {
    res.status(400).json({ error: 'Erreur de création de tâche' });
  }
});

module.exports = router;