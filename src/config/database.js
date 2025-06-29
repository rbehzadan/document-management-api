const knex = require('knex');
const knexConfig = require('../../knexfile');
const logger = require('../utils/logger');

const environment = process.env.NODE_ENV || 'development';
const config = knexConfig[environment];

// Create database connection
const db = knex(config);

// Test database connection
const testConnection = async () => {
  try {
    await db.raw('SELECT 1');
    logger.info(`Database connected successfully (${environment})`);
    return true;
  } catch (error) {
    logger.error('Database connection failed:', error.message);
    return false;
  }
};

// Initialize database connection
testConnection();

module.exports = db;
