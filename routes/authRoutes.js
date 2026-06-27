const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { User } = require('../models/index');

require('dotenv').config();
const SECRET_KEY = process.env.JWT_SECRET; // Clé lue depuis .env

// Limite stricte sur les routes sensibles : 5 tentatives par IP toutes les 15 minutes.
// Protège /login contre le brute force (deviner un mot de passe) et /register contre le spam de comptes.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { error: 'Trop de tentatives. Réessaie dans 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});


// Inscription
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword });
    res.status(201).json({ message: 'Utilisateur créé' });
  } catch (error) {
    res.status(400).json({ error: 'Erreur lors de l\'inscription' });
  }
});

// Connexion
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  
  console.log("Utilisateur trouvé en base :", user ? user.email : "AUCUN");

  if (!user) {
    return res.status(401).json({ error: "Utilisateur non trouvé" });
  }

  if (user && (await bcrypt.compare(password, user.password))) {
    const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Identifiants invalides' });
  }
});

module.exports = router;