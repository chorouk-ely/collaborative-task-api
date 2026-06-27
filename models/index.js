const sequelize = require('../config/database');
const Project = require('./Project');
const User = require('./User');
const Task = require('./Task');

// Définition des relations
Project.belongsTo(User);
User.hasMany(Project);

Project.hasMany(Task);
Task.belongsTo(Project);

module.exports = { sequelize, Project, User, Task };