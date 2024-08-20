require('dotenv').config();
const { Sequelize,DataTypes } = require('sequelize');
const pg = require('pg');
const fs = require('fs');
const sequelize = require('./server/db')
const path = require('path');


const modelsDir = path.join(__dirname, 'server', 'models');
const models = {};

// Read model files and initialize them
fs.readdirSync(modelsDir)
  .filter(file => file.endsWith('.js') && file !== 'index.js')
  .forEach(file => {
    const model = require(path.join(modelsDir, file))(sequelize, DataTypes);
    models[model.name] = model;
  });

// Set up associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// async function createDatabase() {
//   const client = new pg.Client({
//     user: dbUser,
//     password: dbPass,
//     host: dbHost,
//     port: dbPort,
//     database: 'postgres' // Connect to the default 'postgres' database to create a new one
//   });
//   console.log(client)
//   try {
//     await client.connect();
//     const result = await client.query(`SELECT 1 FROM pg_database WHERE datname='${dbName}'`);
//     if (result.rowCount === 0) {
//       console.log(`Creating database ${dbName}...`);
//       await client.query(`CREATE DATABASE ${dbName}`);
//       console.log(`Database ${dbName} created successfully.`);
//     } else {
//       console.log(`Database ${dbName} already exists.`);
//     }
//   } catch (err) {
//     console.error('Error creating database:', err);
//     throw err;
//   } finally {
//     await client.end();
//   }
// }

async function initDb() {
  try {
    // await createDatabase();

    console.log('Starting database initialization...');
  
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    console.log('Syncing database...');
    await sequelize.sync({ force: true });
    console.log('Database synchronized successfully.');

    // Check individual tables
    console.log('Checking individual tables:');
    for (const modelName of Object.keys(models)) {
      try {
        const count = await models[modelName].count();
        console.log(`${modelName} table exists. Row count:`, count);
      } catch (error) {
        console.error(`Error checking ${modelName} table:`, error.message);
      }
    }

    // Query all tables with schema information
    const tables = await sequelize.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema != 'pg_catalog' 
        AND table_schema != 'information_schema'
    `);
    console.log('All tables in the database:', tables[0]);

  } catch (error) {
    console.error('Unable to initialize database:', error);
  } finally {
    await sequelize.close();
    console.log('Database connection closed.');
  }
}

initDb();