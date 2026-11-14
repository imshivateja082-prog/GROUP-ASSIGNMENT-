-- Enable Foreign Key Support in SQLite
PRAGMA foreign_keys = ON;

-- 1. Create Players Table
CREATE TABLE IF NOT EXISTS Players (
  player_id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE
);

-- 2. Create Courts Table
CREATE TABLE IF NOT EXISTS Courts (
  court_id INTEGER PRIMARY KEY AUTOINCREMENT,
  court_name TEXT NOT NULL,
  sport TEXT NOT NULL
);

-- 3. Create Reservations Table
CREATE TABLE IF NOT EXISTS Reservations (
  reservation_id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id INTEGER NOT NULL,
  court_id INTEGER NOT NULL,
  booking_date TEXT NOT NULL,
  time_slot TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  FOREIGN KEY (player_id) REFERENCES Players(player_id) ON DELETE CASCADE,
  FOREIGN KEY (court_id) REFERENCES Courts(court_id) ON DELETE CASCADE
);

-- Sample Data for Players
INSERT OR IGNORE INTO Players (player_id, player_name, email) VALUES
  (1, 'Rahul Sharma', 'rahul.sharma@example.com'),
  (2, 'Priya Patel', 'priya.patel@example.com'),
  (3, 'Amit Verma', 'amit.verma@example.com');

-- Sample Data for Courts
INSERT OR IGNORE INTO Courts (court_id, court_name, sport) VALUES
  (1, 'Sunny Lawn Tennis Court 1', 'Tennis'),
  (2, 'Sunny Indoor Badminton Court A', 'Badminton'),
  (3, 'Sunny Cricket Practice Turf', 'Cricket'),
  (4, 'Sunny Squash Arena', 'Squash');

-- Sample Data for Reservations
INSERT OR IGNORE INTO Reservations (reservation_id, player_id, court_id, booking_date, time_slot, status) VALUES
  (1, 1, 1, '2026-11-20', '09:00 - 10:00', 'pending'),
  (2, 2, 2, '2026-11-20', '10:00 - 11:00', 'approved'),
  (3, 3, 3, '2026-11-21', '18:00 - 19:00', 'done');
