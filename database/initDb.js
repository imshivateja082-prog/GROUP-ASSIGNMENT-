/**
 * database/initDb.js
 * Standalone script to initialize or reset the SunnyCourts database.
 * Run via: node database/initDb.js
 */

const { initializeDatabase } = require('../config/database');

async function run() {
  try {
    console.log('🔄 Initializing SunnyCourts SQLite Database...');
    const db = await initializeDatabase();

    const playersCount = await db.get('SELECT COUNT(*) as count FROM Players');
    const courtsCount = await db.get('SELECT COUNT(*) as count FROM Courts');
    const reservationsCount = await db.get('SELECT COUNT(*) as count FROM Reservations');

    console.log('✅ Database successfully initialized!');
    console.log(`📊 Current Records:`);
    console.log(`   - Players: ${playersCount.count}`);
    console.log(`   - Courts: ${courtsCount.count}`);
    console.log(`   - Reservations: ${reservationsCount.count}`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error initializing database:', err);
    process.exit(1);
  }
}

run();
