require('dotenv').config();// CHARGE LES VARIABLES D'ENVIRONNEMENT
console.log("Nom de la DB:", process.env.DB_NAME);
console.log("Mot de passe chargé:", process.env.DB_PASS ? "Oui" : "Non");
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME, 
  process.env.DB_USER, 
  process.env.DB_PASS, 
  {
    host: '127.0.0.1',
    port: 5432,
    dialect: 'postgres',
    logging: false
  }
);

module.exports = sequelize;