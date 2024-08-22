const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
// const config = require('../config/config.json')[env];
// const db = {};

// let sequelize;
// if (config.use_env_variable) {
//   sequelize = new Sequelize(process.env[config.use_env_variable], config);
// } else {
//   sequelize = new Sequelize(config.database, config.username, config.password, config);
// }
const config = {
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    dialect: 'postgres',
  };
  
  const sequelize = new Sequelize(config.database, config.username, config.password, config);
  
  const User = require('./User')(sequelize, DataTypes);
  const Conversation = require('./Conversation')(sequelize, DataTypes);
  const Message = require('./Message')(sequelize, DataTypes);
  const KnowledgeBase = require('./KnowledgeBase')(sequelize, DataTypes);
  const Document = require('./Document')(sequelize, DataTypes);
  const DocumentChunk = require('./DocumentChunk')(sequelize, DataTypes);

  
  const db = {
    sequelize,
    Sequelize,
    User,
    Conversation,
    Message,
    KnowledgeBase,
    Document,
    DocumentChunk,
  };
  
  // Set up associations
  Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
  });
  
  export default db;