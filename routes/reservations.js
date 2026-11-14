/**
 * routes/reservations.js
 * Express router handling Reservations, JOIN details, and strict status progression
 */

const express = require('express');
const router = express.Router();
const { getDatabase } = require('../config/database');

/**
 * 1. GET /reservations/details (JOIN API)
 * NOTE: Defined BEFORE /:reservationId so Express matches '/details' first.
 * Joins Reservations, Players, and Courts tables to show readable names instead of IDs.
 */
router.get('/details', async (req, res) => {
  try {
    const db = getDatabase();

    const query = `
      SELECT
        r.reservation_id,
        p.player_name,
        c.court_name,
        c.sport,
        r.booking_date,
        r.time_slot,
        r.status
      FROM Reservations r
      JOIN Players p ON r.player_id = p.player_id
      JOIN Courts c ON r.court_id = c.court_id
      ORDER BY r.reservation_id ASC;
    `;

    const details = await db.all(query);
    res.status(200).json(details);
  } catch (error) {
    console.error('Error fetching reservation details:', error);
    res.status(500).json({ error: 'Internal server error while fetching reservation details' });
  }
});

/**
 * 2. GET /reservations
 * Fetch all reservations from the database.
 */
router.get('/', async (req, res) => {
  try {
    const db = getDatabase();
    const reservations = await db.all('SELECT * FROM Reservations ORDER BY reservation_id ASC');
    res.status(200).json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ error: 'Internal server error while fetching reservations' });
  }
});

/**
 * 3. GET /reservations/:reservationId
 * Fetch a single reservation by reservation_id.
 */
router.get('/:reservationId', async (req, res) => {
  try {
    const { reservationId } = req.params;
    const db = getDatabase();

    const reservation = await db.get(
      'SELECT * FROM Reservations WHERE reservation_id = ?',
      [reservationId]
    );

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    res.status(200).json(reservation);
  } catch (error) {
    console.error('Error fetching reservation by id:', error);
    res.status(500).json({ error: 'Internal server error while fetching reservation' });
  }
});

/**
 * 4. POST /reservations
 * Add a new court reservation.
 * Default status must be 'pending'.
 * Validates player_id, court_id, booking_date, and time_slot.
 * Verifies foreign keys exist in Players and Courts tables.
 */
router.post('/', async (req, res) => {
  try {
    const { player_id, court_id, booking_date, time_slot } = req.body;

    // Check required fields
    if (!player_id || !court_id || !booking_date || !time_slot) {
      return res.status(400).json({
        error: 'player_id, court_id, booking_date, and time_slot are required'
      });
    }

    if (typeof booking_date !== 'string' || booking_date.trim() === '') {
      return res.status(400).json({ error: 'Valid booking_date is required' });
    }

    if (typeof time_slot !== 'string' || time_slot.trim() === '') {
      return res.status(400).json({ error: 'Valid time_slot is required' });
    }

    const db = getDatabase();

    // Verify foreign keys: Check that player exists
    const player = await db.get('SELECT * FROM Players WHERE player_id = ?', [player_id]);
    if (!player) {
      return res.status(400).json({ error: 'Invalid player_id: Player does not exist' });
    }

    // Verify foreign keys: Check that court exists
    const court = await db.get('SELECT * FROM Courts WHERE court_id = ?', [court_id]);
    if (!court) {
      return res.status(400).json({ error: 'Invalid court_id: Court does not exist' });
    }

    // Insert new reservation with default status = 'pending'
    const result = await db.run(
      `INSERT INTO Reservations (player_id, court_id, booking_date, time_slot, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [player_id, court_id, booking_date.trim(), time_slot.trim()]
    );

    const newReservation = {
      reservation_id: result.lastID,
      player_id: Number(player_id),
      court_id: Number(court_id),
      booking_date: booking_date.trim(),
      time_slot: time_slot.trim(),
      status: 'pending'
    };

    res.status(201).json({
      message: 'Reservation created successfully',
      reservation: newReservation
    });
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({ error: 'Internal server error while creating reservation' });
  }
});

/**
 * 5. PATCH /reservations/:id/status
 * Special Requirement: Strictly controlled reservation status transitions.
 * Allowed transitions (only one step forward):
 * - pending  -> approved (HTTP 200)
 * - approved -> done     (HTTP 200)
 *
 * Any other transition must return HTTP 400 with error: "Invalid status change"
 */
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || typeof status !== 'string') {
      return res.status(400).json({ error: 'Invalid status change' });
    }

    const newStatus = status.trim().toLowerCase();
    const db = getDatabase();

    // Fetch existing reservation
    const reservation = await db.get(
      'SELECT * FROM Reservations WHERE reservation_id = ?',
      [id]
    );

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    const currentStatus = reservation.status.toLowerCase();

    // Check allowed one-step-forward transitions
    const isValidTransition =
      (currentStatus === 'pending' && newStatus === 'approved') ||
      (currentStatus === 'approved' && newStatus === 'done');

    if (!isValidTransition) {
      return res.status(400).json({ error: 'Invalid status change' });
    }

    // Update reservation status in database
    await db.run(
      'UPDATE Reservations SET status = ? WHERE reservation_id = ?',
      [newStatus, id]
    );

    res.status(200).json({
      message: 'Reservation status updated successfully',
      reservation_id: Number(id),
      status: newStatus
    });
  } catch (error) {
    console.error('Error updating reservation status:', error);
    res.status(500).json({ error: 'Internal server error while updating reservation status' });
  }
});

module.exports = router;
