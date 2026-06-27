const express = require('express');
// On importe sequelize et nos modèles depuis le fichier index.js
const { sequelize, Project, User, Task } = require('./models/index');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const authRoutes = require('./routes/authRoutes');
const cors = require('cors');
const rateLimit = require('express-rate-limit');


const app = express();

// Middleware pour parser le JSON
app.use(express.json());
app.use(cors());

// Limite générale : 100 requêtes par IP toutes les 15 minutes sur toute l'API.
// /login et /register ont en plus leur propre limite, plus stricte (voir authRoutes.js).
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Trop de requêtes depuis cette adresse IP. Réessaie plus tard.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', apiLimiter);

// Enregistrement des routes
app.use('/api/projects', projectRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Fonction pour initialiser la base et lancer le serveur
async function startServer() {
  try {
    // 1. Authentification
    await sequelize.authenticate();
    console.log('Base de données connectée !');

    // 2. Synchronisation (crée ou met à jour les tables)
    // { alter: true } permet de modifier les colonnes existantes sans supprimer les données
    await sequelize.sync({ alter: true }); 
    console.log('Tables synchronisées avec succès.');

    // 3. Lancement du serveur
    app.listen(3000, () => {
      console.log('Serveur lancé sur le port 3000');
    });
  } catch (error) {
    console.error('Erreur lors du démarrage du serveur :', error);
  }
}

startServer();