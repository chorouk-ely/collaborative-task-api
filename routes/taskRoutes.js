const { Task, Project } = require('../models/index'); // On importe Task et Project depuis index.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Lister MES tâches : toutes celles qui appartiennent à un de mes projets (protégé)
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.findAll({
      include: [{ model: Project, where: { UserId: req.userId }, attributes: [] }]
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des tâches' });
  }
});

// Marquer une tâche comme terminée (protégé + vérifie que la tâche appartient à un de mes projets)
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id, { include: [Project] });
    if (!task || !task.Project || task.Project.UserId !== req.userId) {
      return res.status(404).json({ error: 'Tâche non trouvée' });
    }
    task.status = 'terminée'; // ou req.body.status
    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
});

module.exports = router;