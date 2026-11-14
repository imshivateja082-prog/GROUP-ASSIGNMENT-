/**
 * app.js
 * Main entry point for the SunnyCourts Club Court Booking Management System
 * Built with Express.js and SQLite.
 */

const express = require('express');
const { initializeDatabase } = require('./config/database');

const playersRoutes = require('./routes/players');
const courtsRoutes = require('./routes/courts');
const reservationsRoutes = require('./routes/reservations');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse incoming JSON request bodies
app.use(express.json());

// Friendly welcome & API overview endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    project: 'SunnyCourts Club – Court Booking Management System',
    version: '1.0.0',
    description: 'REST API backend for managing players, sports courts, and bookings.',
    endpoints: {
      players: ['GET /players', 'GET /players/:playerId', 'POST /players'],
      courts: [
        'GET /courts',
        'GET /courts?sport=<sport>',
        'GET /courts/:courtId',
        'POST /courts',
        'PUT /courts/:courtId',
        'DELETE /courts/:courtId'
      ],
      reservations: [
        'GET /reservations',
        'GET /reservations/details',
        'GET /reservations/:reservationId',
        'POST /reservations',
        'PATCH /reservations/:id/status'
      ]
    }
  });
});

// Mount application routes
app.use('/players', playersRoutes);
app.use('/courts', courtsRoutes);
app.use('/reservations', reservationsRoutes);

// 404 Route Not Found handler
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  // Catch bad JSON syntax errors from express.json()
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Malformed JSON payload' });
  }

  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// Start the server after initializing database
async function startServer() {
  try {
    await initializeDatabase();
    console.log('✅ SQLite database initialized successfully.');

    const server = app.listen(PORT, () => {
      console.log(`🚀 SunnyCourts Club server is running on http://localhost:${PORT}`);
    });
    return server;
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
