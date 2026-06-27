const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Task = sequelize.define('Task', {
  title: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'à faire' }
});

module.exports = Task;