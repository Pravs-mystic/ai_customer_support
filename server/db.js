const { Sequelize } = require('sequelize');
const pgvector = require('pgvector/sequelize');
require('dotenv').config();


const dbName = process.env.DB_NAME||"doc_chat";
const dbUser = process.env.DB_USER||"sauce";
const dbPass = process.env.DB_PASS||"postgresify";
const dbHost = process.env.DB_HOST||"10.0.0.226";
const dbPort = process.env.DB_PORT||"5432";

pgvector.registerType(Sequelize);
const sequelize = new Sequelize(dbName, dbUser, dbPass, {
  host: dbHost,
  port: dbPort,
  dialect: 'postgres',
  dialectModule: require('pg'),
  logging: console.log
});

module.exports = sequelize;