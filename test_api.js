/**
 * test_api.js
 * Automated test script to verify all SunnyCourts Club API endpoints.
 * Run via: npm test  or  node test_api.js
 */

const http = require('http');
const { app, startServer } = require('./app');
const { initializeDatabase } = require('./config/database');

const BASE_URL = 'http://localhost:3000';

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch (e) {
          parsed = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: parsed
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

let passedCount = 0;
let failedCount = 0;

function assertTest(name, condition, details = '') {
  if (condition) {
    console.log(`  ✅ PASS: ${name}`);
    passedCount++;
  } else {
    console.error(`  ❌ FAIL: ${name}`);
    if (details) console.error(`     Details: ${details}`);
    failedCount++;
  }
}

async function runAllTests() {
  console.log('\n======================================================');
  console.log('🧪 Starting SunnyCourts Club Automated API Test Suite');
  console.log('======================================================\n');

  // Re-seed DB to a fresh known state
  const db = await initializeDatabase();
  // Clear and re-populate
  await db.exec('PRAGMA foreign_keys = OFF;');
  await db.exec('DELETE FROM Reservations;');
  await db.exec('DELETE FROM Courts;');
  await db.exec('DELETE FROM Players;');
  await db.exec('PRAGMA foreign_keys = ON;');

  // Run initial script again
  const fs = require('fs');
  const path = require('path');
  const initSql = fs.readFileSync(path.join(__dirname, 'database', 'init.sql'), 'utf-8');
  await db.exec(initSql);

  const server = app.listen(3000);

  try {
    // -------------------------------------------------------------------------
    console.log('\n--- 1. Players APIs ---');
    // Test 1: GET /players
    const resGetPlayers = await request('GET', '/players');
    assertTest('GET /players returns HTTP 200', resGetPlayers.status === 200);
    assertTest('GET /players returns array of players', Array.isArray(resGetPlayers.data) && resGetPlayers.data.length >= 3);

    // Test 2: GET /players/:playerId (valid & 404)
    const resGetPlayer1 = await request('GET', '/players/1');
    assertTest('GET /players/1 returns HTTP 200', resGetPlayer1.status === 200 && resGetPlayer1.data.player_id === 1);
    const resGetPlayer404 = await request('GET', '/players/9999');
    assertTest('GET /players/9999 returns HTTP 404', resGetPlayer404.status === 404);

    // Test 3: POST /players (valid & validation errors)
    const newPlayerEmail = `testplayer_${Date.now()}@example.com`;
    const resAddPlayer = await request('POST', '/players', {
      player_name: 'Sneha Reddy',
      email: newPlayerEmail
    });
    assertTest('POST /players returns HTTP 201', resAddPlayer.status === 201 && resAddPlayer.data.player.player_name === 'Sneha Reddy');

    const resAddPlayerInvalid = await request('POST', '/players', { player_name: '' });
    assertTest('POST /players with missing email returns HTTP 400', resAddPlayerInvalid.status === 400);

    const resAddPlayerDuplicate = await request('POST', '/players', {
      player_name: 'Sneha Clone',
      email: newPlayerEmail
    });
    assertTest('POST /players with duplicate email returns HTTP 400', resAddPlayerDuplicate.status === 400);

    // -------------------------------------------------------------------------
    console.log('\n--- 2. Courts APIs & CRUD ---');
    // Test 4: GET /courts
    const resGetCourts = await request('GET', '/courts');
    assertTest('GET /courts returns HTTP 200', resGetCourts.status === 200);
    assertTest('GET /courts returns array of courts', Array.isArray(resGetCourts.data) && resGetCourts.data.length >= 4);

    // Test 5: GET /courts/:courtId
    const resGetCourt1 = await request('GET', '/courts/1');
    assertTest('GET /courts/1 returns HTTP 200', resGetCourt1.status === 200 && resGetCourt1.data.court_id === 1);
    const resGetCourt404 = await request('GET', '/courts/9999');
    assertTest('GET /courts/9999 returns HTTP 404', resGetCourt404.status === 404);

    // Test 6: POST /courts
    const resAddCourt = await request('POST', '/courts', {
      court_name: 'Sunny Basketball Court',
      sport: 'Basketball'
    });
    assertTest('POST /courts returns HTTP 201', resAddCourt.status === 201 && resAddCourt.data.court.sport === 'Basketball');
    const createdCourtId = resAddCourt.data.court.court_id;

    const resAddCourtInvalid = await request('POST', '/courts', { court_name: '' });
    assertTest('POST /courts with missing fields returns HTTP 400', resAddCourtInvalid.status === 400);

    // Test 7: PUT /courts/:courtId
    const resUpdateCourt = await request('PUT', `/courts/${createdCourtId}`, {
      court_name: 'Sunny Basketball Arena Deluxe',
      sport: 'Basketball'
    });
    assertTest('PUT /courts/:courtId returns HTTP 200', resUpdateCourt.status === 200 && resUpdateCourt.data.court.court_name === 'Sunny Basketball Arena Deluxe');

    const resUpdateCourt404 = await request('PUT', '/courts/9999', {
      court_name: 'Non Existent',
      sport: 'Unknown'
    });
    assertTest('PUT /courts/9999 returns HTTP 404', resUpdateCourt404.status === 404);

    // Test 8: DELETE /courts/:courtId
    const resDeleteCourt = await request('DELETE', `/courts/${createdCourtId}`);
    assertTest('DELETE /courts/:courtId returns HTTP 200', resDeleteCourt.status === 200);
    const resDeleteCourt404 = await request('DELETE', `/courts/${createdCourtId}`);
    assertTest('DELETE non-existent court returns HTTP 404', resDeleteCourt404.status === 404);

    // Test 9: Search courts by sport query parameter
    const resSearchSport = await request('GET', '/courts?sport=cricket');
    assertTest('GET /courts?sport=cricket returns HTTP 200', resSearchSport.status === 200);
    const allCricket = resSearchSport.data.every(c => c.sport.toLowerCase() === 'cricket');
    assertTest('GET /courts?sport=cricket returns only cricket courts', allCricket && resSearchSport.data.length > 0);

    // -------------------------------------------------------------------------
    console.log('\n--- 3. Reservations APIs & JOIN Endpoint ---');
    // Test 10: POST /reservations (Default status pending)
    const resAddReservation = await request('POST', '/reservations', {
      player_id: 1,
      court_id: 2,
      booking_date: '2026-11-28',
      time_slot: '07:00 - 08:00'
    });
    assertTest('POST /reservations returns HTTP 201', resAddReservation.status === 201);
    assertTest('New reservation has default status = "pending"', resAddReservation.data.reservation.status === 'pending');
    const newReservationId = resAddReservation.data.reservation.reservation_id;

    // Test foreign key validation
    const resAddResBadPlayer = await request('POST', '/reservations', {
      player_id: 9999,
      court_id: 1,
      booking_date: '2026-11-28',
      time_slot: '07:00 - 08:00'
    });
    assertTest('POST /reservations with non-existent player_id returns HTTP 400', resAddResBadPlayer.status === 400);

    // Test 11: GET /reservations
    const resGetReservations = await request('GET', '/reservations');
    assertTest('GET /reservations returns HTTP 200', resGetReservations.status === 200);
    assertTest('GET /reservations returns array', Array.isArray(resGetReservations.data) && resGetReservations.data.length >= 4);

    // Test 12: GET /reservations/:reservationId
    const resGetSingleRes = await request('GET', `/reservations/${newReservationId}`);
    assertTest('GET /reservations/:reservationId returns HTTP 200', resGetSingleRes.status === 200 && resGetSingleRes.data.reservation_id === newReservationId);

    // Test 13: GET /reservations/details (JOIN query)
    const resJoinDetails = await request('GET', '/reservations/details');
    assertTest('GET /reservations/details returns HTTP 200', resJoinDetails.status === 200);
    assertTest('JOIN returns player_name and court_name (not just IDs)',
      Array.isArray(resJoinDetails.data) &&
      resJoinDetails.data[0].player_name !== undefined &&
      resJoinDetails.data[0].court_name !== undefined &&
      resJoinDetails.data[0].sport !== undefined
    );

    // -------------------------------------------------------------------------
    console.log('\n--- 4. Special Requirement – Reservation Status Flow ---');
    // Test 14a: Allowed: pending -> approved (HTTP 200)
    // Reservation newReservationId is currently 'pending'
    const resPendingToApproved = await request('PATCH', `/reservations/${newReservationId}/status`, {
      status: 'approved'
    });
    assertTest('Status change: pending -> approved returns HTTP 200',
      resPendingToApproved.status === 200 && resPendingToApproved.data.status === 'approved'
    );

    // Test 14b: Allowed: approved -> done (HTTP 200)
    const resApprovedToDone = await request('PATCH', `/reservations/${newReservationId}/status`, {
      status: 'done'
    });
    assertTest('Status change: approved -> done returns HTTP 200',
      resApprovedToDone.status === 200 && resApprovedToDone.data.status === 'done'
    );

    // Test 14c: Invalid: done -> approved (HTTP 400)
    const resDoneToApproved = await request('PATCH', `/reservations/${newReservationId}/status`, {
      status: 'approved'
    });
    assertTest('Invalid transition: done -> approved returns HTTP 400',
      resDoneToApproved.status === 400 && resDoneToApproved.data.error === 'Invalid status change'
    );

    // Test 14d: Invalid: pending -> done (HTTP 400)
    // Create a fresh reservation in 'pending' status
    const resPendingRes = await request('POST', '/reservations', {
      player_id: 2,
      court_id: 1,
      booking_date: '2026-11-29',
      time_slot: '11:00 - 12:00'
    });
    const pendingResId = resPendingRes.data.reservation.reservation_id;

    const resPendingToDone = await request('PATCH', `/reservations/${pendingResId}/status`, {
      status: 'done'
    });
    assertTest('Invalid transition: pending -> done returns HTTP 400',
      resPendingToDone.status === 400 && resPendingToDone.data.error === 'Invalid status change'
    );

    // Test 14e: Invalid: approved -> pending (HTTP 400)
    // First advance pending to approved
    await request('PATCH', `/reservations/${pendingResId}/status`, { status: 'approved' });
    const resApprovedToPending = await request('PATCH', `/reservations/${pendingResId}/status`, {
      status: 'pending'
    });
    assertTest('Invalid transition: approved -> pending returns HTTP 400',
      resApprovedToPending.status === 400 && resApprovedToPending.data.error === 'Invalid status change'
    );

    // Test 14f: Non-existent reservation status update (HTTP 404)
    const resStatus404 = await request('PATCH', '/reservations/9999/status', { status: 'approved' });
    assertTest('PATCH status for non-existent reservation returns HTTP 404', resStatus404.status === 404);

    console.log('\n======================================================');
    console.log(`📊 Test Summary: ${passedCount} PASSED, ${failedCount} FAILED`);
    console.log('======================================================\n');

  } finally {
    server.close();
  }

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAllTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
