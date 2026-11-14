/**
 * config/database.js
 * Database connection configuration using 'sqlite' and 'sqlite3'
 * Ensures PRAGMA foreign_keys = ON is enabled for relational integrity.
 */

const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const DB_PATH = path.join(__dirname, '..', 'database', 'sunnycourts.db');
const INIT_SQL_PATH = path.join(__dirname, '..', 'database', 'init.sql');

let dbInstance = null;

/**
 * Initializes and returns the SQLite database connection.
 * Creates the database file and runs init.sql if tables do not exist.
 */
async function initializeDatabase() {
  if (dbInstance) {
    return dbInstance;
  }

  // Ensure database directory exists
  const dbDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Open SQLite database connection
  dbInstance = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });

  // Enable SQLite foreign key constraints and WAL mode for concurrency
  await dbInstance.exec('PRAGMA foreign_keys = ON;');
  await dbInstance.exec('PRAGMA journal_mode = WAL;');

  // Read and execute initial schema and sample data
  if (fs.existsSync(INIT_SQL_PATH)) {
    const initSql = fs.readFileSync(INIT_SQL_PATH, 'utf-8');
    await dbInstance.exec(initSql);
  }

  return dbInstance;
}

/**
 * Helper to get the active database instance.
 */
function getDatabase() {
  if (!dbInstance) {
    throw new Error('Database is not initialized yet. Call initializeDatabase() first.');
  }
  return dbInstance;
}

module.exports = {
  initializeDatabase,
  getDatabase,
  DB_PATH
};
