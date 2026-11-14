/**
 * routes/courts.js
 * Express router handling all Court CRUD operations and Sport search
 */

const express = require('express');
const router = express.Router();
const { getDatabase } = require('../config/database');

/**
 * 1. GET /courts
 * Fetch all courts or filter courts by sport query parameter (e.g. GET /courts?sport=cricket)
 */
router.get('/', async (req, res) => {
  try {
    const { sport } = req.query;
    const db = getDatabase();

    if (sport && typeof sport === 'string' && sport.trim() !== '') {
      // Search courts matching the requested sport (case-insensitive)
      const courts = await db.all(
        'SELECT * FROM Courts WHERE LOWER(sport) = LOWER(?) ORDER BY court_id ASC',
        [sport.trim()]
      );
      return res.status(200).json(courts);
    }

    // Return all courts if no query parameter is provided
    const courts = await db.all('SELECT * FROM Courts ORDER BY court_id ASC');
    res.status(200).json(courts);
  } catch (error) {
    console.error('Error fetching courts:', error);
    res.status(500).json({ error: 'Internal server error while fetching courts' });
  }
});

/**
 * 2. GET /courts/:courtId
 * Fetch details of a single court by court_id
 */
router.get('/:courtId', async (req, res) => {
  try {
    const { courtId } = req.params;
    const db = getDatabase();

    const court = await db.get('SELECT * FROM Courts WHERE court_id = ?', [courtId]);

    if (!court) {
      return res.status(404).json({ error: 'Court not found' });
    }

    res.status(200).json(court);
  } catch (error) {
    console.error('Error fetching court by id:', error);
    res.status(500).json({ error: 'Internal server error while fetching court' });
  }
});

/**
 * 3. POST /courts
 * Add a new court with court_name and sport
 */
router.post('/', async (req, res) => {
  try {
    const { court_name, sport } = req.body;

    // Validation: Check required fields
    if (!court_name || typeof court_name !== 'string' || court_name.trim() === '') {
      return res.status(400).json({ error: 'Court name is required' });
    }

    if (!sport || typeof sport !== 'string' || sport.trim() === '') {
      return res.status(400).json({ error: 'Sport is required' });
    }

    const db = getDatabase();

    const result = await db.run(
      'INSERT INTO Courts (court_name, sport) VALUES (?, ?)',
      [court_name.trim(), sport.trim()]
    );

    const newCourt = {
      court_id: result.lastID,
      court_name: court_name.trim(),
      sport: sport.trim()
    };

    res.status(201).json({
      message: 'Court added successfully',
      court: newCourt
    });
  } catch (error) {
    console.error('Error adding court:', error);
    res.status(500).json({ error: 'Internal server error while adding court' });
  }
});

/**
 * 4. PUT /courts/:courtId
 * Update details of an existing court
 */
router.put('/:courtId', async (req, res) => {
  try {
    const { courtId } = req.params;
    const { court_name, sport } = req.body;

    // Validation: Check required fields
    if (!court_name || typeof court_name !== 'string' || court_name.trim() === '') {
      return res.status(400).json({ error: 'Court name is required' });
    }

    if (!sport || typeof sport !== 'string' || sport.trim() === '') {
      return res.status(400).json({ error: 'Sport is required' });
    }

    const db = getDatabase();

    // Check if court exists
    const existingCourt = await db.get('SELECT * FROM Courts WHERE court_id = ?', [courtId]);
    if (!existingCourt) {
      return res.status(404).json({ error: 'Court not found' });
    }

    await db.run(
      'UPDATE Courts SET court_name = ?, sport = ? WHERE court_id = ?',
      [court_name.trim(), sport.trim(), courtId]
    );

    const updatedCourt = {
      court_id: Number(courtId),
      court_name: court_name.trim(),
      sport: sport.trim()
    };

    res.status(200).json({
      message: 'Court updated successfully',
      court: updatedCourt
    });
  } catch (error) {
    console.error('Error updating court:', error);
    res.status(500).json({ error: 'Internal server error while updating court' });
  }
});

/**
 * 5. DELETE /courts/:courtId
 * Delete a court by court_id
 */
router.delete('/:courtId', async (req, res) => {
  try {
    const { courtId } = req.params;
    const db = getDatabase();

    // Check if court exists
    const existingCourt = await db.get('SELECT * FROM Courts WHERE court_id = ?', [courtId]);
    if (!existingCourt) {
      return res.status(404).json({ error: 'Court not found' });
    }

    await db.run('DELETE FROM Courts WHERE court_id = ?', [courtId]);

    res.status(200).json({
      message: 'Court deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting court:', error);
    res.status(500).json({ error: 'Internal server error while deleting court' });
  }
});

module.exports = router;
