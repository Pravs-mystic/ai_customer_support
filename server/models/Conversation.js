const { DataTypes } = require('sequelize');
const sequelize = require('../db');

module.exports = (sequelize, DataTypes) => {
const Conversation = sequelize.define('Conversation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  }, 
});

Conversation.associate = function(models) {
  Conversation.hasMany(models.Message);
};

return Conversation;

}