const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../db');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true, // Allow null for Google sign-in users
    },
    displayName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    photoURL: {
      type: DataTypes.STRING,
    },
  });

  User.associate = function(models) {
    User.hasMany(models.Conversation);
  };

  // CRUD operations
  User.createUser = async function(userData) {
    return await this.create(userData);
  };

  User.getUser = async function(id) {
    return await this.findByPk(id);
  };

  User.updateUser = async function(id, updateData) {
    const user = await this.findByPk(id);
    if (user) {
      return await user.update(updateData);
    }
    return null;
  };

  User.deleteUser = async function(id) {
    const user = await this.findByPk(id);
    if (user) {
      await user.destroy();
      return true;
    }
    return false;
  };

  return User;
};