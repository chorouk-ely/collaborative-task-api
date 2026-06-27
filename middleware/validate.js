const { body, validationResult } = require('express-validator');

// Liste des règles de validation pour un projet
const validateProject = [
  body('name').notEmpty().withMessage('Le nom est obligatoire'),
  body('description').optional().isLength({ min: 5 }).withMessage('La description doit faire au moins 5 caractères'),
  
  // Middleware pour vérifier s'il y a des erreurs
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = { validateProject };