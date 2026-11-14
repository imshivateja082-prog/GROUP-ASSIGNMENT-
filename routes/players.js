/**
 * routes/players.js
 * Express router handling all Player-related endpoints
 */

const express = require('express');
const router = express.Router();
const { getDatabase } = require('../config/database');

/**
 * 1. GET /players
 * Fetch all registered players from the database.
 */
router.get('/', async (req, res) => {
  try {
    const db = getDatabase();
    const players = await db.all('SELECT * FROM Players ORDER BY player_id ASC');
    res.status(200).json(players);
  } catch (error) {
    console.error('Error fetching players:', error);
    res.status(500).json({ error: 'Internal server error while fetching players' });
  }
});

/**
 * 2. GET /players/:playerId
 * Fetch a single player by their player_id.
 */
router.get('/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;
    const db = getDatabase();

    const player = await db.get('SELECT * FROM Players WHERE player_id = ?', [playerId]);

    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    res.status(200).json(player);
  } catch (error) {
    console.error('Error fetching player by id:', error);
    res.status(500).json({ error: 'Internal server error while fetching player' });
  }
});

/**
 * 3. POST /players
 * Add a new player.
 * Validates player_name and email, checks for unique email.
 */
router.post('/', async (req, res) => {
  try {
    const { player_name, email } = req.body;

    // Validation: Check required fields
    if (!player_name || typeof player_name !== 'string' || player_name.trim() === '') {
      return res.status(400).json({ error: 'Player name is required' });
    }

    if (!email || typeof email !== 'string' || email.trim() === '') {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const db = getDatabase();

    // Check if email is already registered
    const existingPlayer = await db.get('SELECT * FROM Players WHERE LOWER(email) = LOWER(?)', [email.trim()]);
    if (existingPlayer) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    // Insert new player
    const result = await db.run(
      'INSERT INTO Players (player_name, email) VALUES (?, ?)',
      [player_name.trim(), email.trim()]
    );

    const newPlayer = {
      player_id: result.lastID,
      player_name: player_name.trim(),
      email: email.trim()
    };

    res.status(201).json({
      message: 'Player added successfully',
      player: newPlayer
    });
  } catch (error) {
    console.error('Error adding player:', error);
    res.status(500).json({ error: 'Internal server error while adding player' });
  }
});

module.exports = router;
