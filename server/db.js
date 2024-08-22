const { Sequelize } = require('sequelize');
const pgvector = require('pgvector/sequelize');
require('dotenv').config();


const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;
const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT;

pgvector.registerType(Sequelize);
const sequelize = new Sequelize(dbName, dbUser, dbPass, {
  host: dbHost,
  port: dbPort,
  dialect: 'postgres',
  dialectModule: require('pg'),
  logging: console.log
});

module.exports = sequelize;