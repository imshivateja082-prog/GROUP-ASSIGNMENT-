# 🎾 SunnyCourts Club – Court Booking Management System

A complete, robust, and beginner-friendly REST API backend built for **SunnyCourts Club** to replace the outdated whiteboard booking system. This system allows members to book sports courts, prevents double bookings, provides search and relational queries, and strictly regulates booking status transitions.

---

## 📋 Table of Contents
1. [Project Overview](#-project-overview)
2. [Technologies Used](#-technologies-used)
3. [Database Architecture](#-database-architecture)
4. [Project Structure](#-project-structure)
5. [Installation & Setup](#-installation--setup)
6. [Running the Application](#-running-the-application)
7. [API Endpoints Reference](#-api-endpoints-reference)
8. [Special Requirement: Reservation Status Flow](#-special-requirement-reservation-status-flow)
9. [Automated Testing & Postman Instructions](#-automated-testing--postman-instructions)
10. [GitHub Submission Guide](#-github-submission-guide)

---

## 📖 Project Overview

SunnyCourts Club previously relied on a physical whiteboard for court reservations. This caused issues like erased names, conflicting slots, and member disputes. 

This backend system provides:
- **Player Management:** Register and look up club players.
- **Court Management & Discovery:** Complete CRUD operations for sports courts, plus filtering courts by sport using query parameters (e.g., `?sport=cricket`).
- **Relational Court Reservations:** Book courts with automatic `pending` status and foreign key validations.
- **Relational JOIN Endpoint:** View reservations enriched with player and court names.
- **Strict Status Flow Engine:** Enforce a strict one-step-forward lifecycle: `pending` → `approved` → `done`, blocking unauthorized or backward transitions with HTTP 400.

---

## 🛠 Technologies Used

This project strictly adheres to the **Backend Development Fundamentals** syllabus:
- **Runtime Environment:** [Node.js](https://nodejs.org/) (v16+)
- **Web Framework:** [Express.js](https://expressjs.com/) (v4.x)
- **Database Engine:** [SQLite3](https://www.sqlite.org/) (file-based relational database)
- **Database Driver:** `sqlite` (Promise-based wrapper) & `sqlite3`
- **Module System:** JavaScript CommonJS (`require` / `module.exports`)
- **Development Tool:** [Nodemon](https://nodemon.io/) for hot-reloading
- **API Testing:** Postman & Native Node.js Automated Test Suite

No external UI frameworks, TypeScript, or heavy ORMs are used, ensuring the codebase is clean, accessible, and easy to explain.

---

## 🗄 Database Architecture

The SQLite database file is located at `database/sunnycourts.db`. SQLite foreign keys are explicitly enabled (`PRAGMA foreign_keys = ON;`).

```
 +------------------+          +------------------------+          +------------------+
 |     PLAYERS      |          |      RESERVATIONS      |          |      COURTS      |
 +------------------+          +------------------------+          +------------------+
 | player_id (PK)   |<----+    | reservation_id (PK)    |    +---->| court_id (PK)    |
 | player_name      |     +----| player_id (FK)         |    |     | court_name       |
 | email (UNIQUE)   |          | court_id (FK)          |----+     | sport            |
 +------------------+          | booking_date           |          +------------------+
                               | time_slot              |
                               | status (DEFAULT: 'pending')
                               +------------------------+
```

### Table Definitions:
1. **Players**
   - `player_id`: `INTEGER PRIMARY KEY AUTOINCREMENT`
   - `player_name`: `TEXT NOT NULL`
   - `email`: `TEXT NOT NULL UNIQUE`
2. **Courts**
   - `court_id`: `INTEGER PRIMARY KEY AUTOINCREMENT`
   - `court_name`: `TEXT NOT NULL`
   - `sport`: `TEXT NOT NULL`
3. **Reservations**
   - `reservation_id`: `INTEGER PRIMARY KEY AUTOINCREMENT`
   - `player_id`: `INTEGER NOT NULL` (Foreign Key referencing `Players(player_id)` ON DELETE CASCADE)
   - `court_id`: `INTEGER NOT NULL` (Foreign Key referencing `Courts(court_id)` ON DELETE CASCADE)
   - `booking_date`: `TEXT NOT NULL` (e.g. `YYYY-MM-DD`)
   - `time_slot`: `TEXT NOT NULL` (e.g. `09:00 - 10:00`)
   - `status`: `TEXT NOT NULL DEFAULT 'pending'` (`pending`, `approved`, `done`)

---

## 📁 Project Structure

```
sunnycourts-club/
│
├── config/
│   └── database.js               # SQLite connection helper (sqlite + sqlite3, foreign keys enabled)
│
├── database/
│   ├── init.sql                  # Table schema definitions & sample seed records
│   ├── initDb.js                 # Standalone script to initialize or reset the database
│   └── sunnycourts.db            # SQLite database file (auto-generated)
│
├── routes/
│   ├── players.js                # GET /players, GET /players/:id, POST /players
│   ├── courts.js                 # GET /courts (all & ?sport=), GET /:id, POST, PUT, DELETE
│   └── reservations.js           # GET /reservations, GET /details, POST, PATCH /:id/status
│
├── app.js                        # Express server entry point (port 3000, middleware & router mounts)
├── package.json                  # Dependencies & npm scripts
├── test_api.js                   # Automated test script testing all 14 endpoints and edge cases
├── SunnyCourts_Club_API.postman_collection.json # Ready-to-import Postman v2.1 collection
├── .gitignore                    # Ignores node_modules and OS cache files
└── README.md                     # Comprehensive project documentation
```

### Purpose of Each File:
- **`app.js`**: Initializes Express, registers `express.json()`, mounts routers, configures 404/500 error handlers, and boots the HTTP server on port 3000.
- **`config/database.js`**: Establishes the SQLite connection using `sqlite` and `sqlite3`, enables `PRAGMA foreign_keys = ON;`, and supports WAL mode for concurrency.
- **`database/init.sql`**: Contains the DDL (`CREATE TABLE IF NOT EXISTS`) and initial seed data for players, courts, and reservations.
- **`database/initDb.js`**: Standalone helper to reset or verify the database.
- **`routes/players.js`**: Route handlers for player creation and retrieval with input validation.
- **`routes/courts.js`**: Full CRUD handlers for courts, plus sport-based search query parameter filtering.
- **`routes/reservations.js`**: Reservation booking, JOIN query endpoint, and the strict status transition state machine.
- **`SunnyCourts_Club_API.postman_collection.json`**: Pre-configured Postman collection with tests for all 14 assignment requirements.
- **`test_api.js`**: Automated test script validating status codes, response payloads, and invalid transition handling.

---

## 🚀 Installation & Setup

### 1. Prerequisites
- **Node.js** (v16.0.0 or higher): Check with `node -v`
- **npm** (v8.0.0 or higher): Check with `npm -v`

### 2. Install Project Dependencies
Open your terminal in the project directory and run:
```bash
npm install
```
*(Alternatively, if installing packages manually:)*
```bash
npm install express sqlite sqlite3
npm install --save-dev nodemon
```

### 3. Initialize the Database
The database initializes automatically when starting the server. However, you can also manually initialize or reset the database at any time using:
```bash
npm run init-db
```

---

## 💻 Running the Application

### Option A: Standard Run
```bash
npm start
# or
node app.js
```

### Option B: Development Mode (Auto-reload with Nodemon)
To install nodemon globally (optional):
```bash
npm install -g nodemon
```
Then start the server:
```bash
npm run dev
# or
nodemon app.js
```

The server will display:
```
✅ SQLite database initialized successfully.
🚀 SunnyCourts Club server is running on http://localhost:3000
```

---

## 📡 API Endpoints Reference

Base URL: `http://localhost:3000`

### A. Players APIs

#### 1. Get All Players
- **Method:** `GET`
- **Path:** `/players`
- **Response:** `HTTP 200 OK`
```json
[
  {
    "player_id": 1,
    "player_name": "Rahul Sharma",
    "email": "rahul.sharma@example.com"
  },
  {
    "player_id": 2,
    "player_name": "Priya Patel",
    "email": "priya.patel@example.com"
  }
]
```

#### 2. Get One Player
- **Method:** `GET`
- **Path:** `/players/:playerId` (e.g. `/players/1`)
- **Response:** `HTTP 200 OK`
```json
{
  "player_id": 1,
  "player_name": "Rahul Sharma",
  "email": "rahul.sharma@example.com"
}
```
*(If player does not exist, returns `HTTP 404` with `{"error": "Player not found"}`)*

#### 3. Add a Player
- **Method:** `POST`
- **Path:** `/players`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "player_name": "Vikram Malhotra",
  "email": "vikram.malhotra@example.com"
}
```
- **Response:** `HTTP 201 Created`
```json
{
  "message": "Player added successfully",
  "player": {
    "player_id": 4,
    "player_name": "Vikram Malhotra",
    "email": "vikram.malhotra@example.com"
  }
}
```

---

### B. Courts APIs

#### 4. Get All Courts
- **Method:** `GET`
- **Path:** `/courts`
- **Response:** `HTTP 200 OK`
```json
[
  {
    "court_id": 1,
    "court_name": "Sunny Lawn Tennis Court 1",
    "sport": "Tennis"
  },
  {
    "court_id": 2,
    "court_name": "Sunny Indoor Badminton Court A",
    "sport": "Badminton"
  }
]
```

#### 5. Search Courts by Sport (Query Parameter)
- **Method:** `GET`
- **Path:** `/courts?sport=cricket`
- **Response:** `HTTP 200 OK`
```json
[
  {
    "court_id": 3,
    "court_name": "Sunny Cricket Practice Turf",
    "sport": "Cricket"
  }
]
```

#### 6. Get One Court
- **Method:** `GET`
- **Path:** `/courts/:courtId` (e.g. `/courts/1`)
- **Response:** `HTTP 200 OK`
```json
{
  "court_id": 1,
  "court_name": "Sunny Lawn Tennis Court 1",
  "sport": "Tennis"
}
```

#### 7. Add a Court
- **Method:** `POST`
- **Path:** `/courts`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "court_name": "Sunny Olympic Swimming Pool",
  "sport": "Swimming"
}
```
- **Response:** `HTTP 201 Created`
```json
{
  "message": "Court added successfully",
  "court": {
    "court_id": 5,
    "court_name": "Sunny Olympic Swimming Pool",
    "sport": "Swimming"
  }
}
```

#### 8. Update a Court
- **Method:** `PUT`
- **Path:** `/courts/:courtId` (e.g. `/courts/1`)
- **Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "court_name": "Sunny Grand Lawn Tennis Court 1",
  "sport": "Tennis"
}
```
- **Response:** `HTTP 200 OK`
```json
{
  "message": "Court updated successfully",
  "court": {
    "court_id": 1,
    "court_name": "Sunny Grand Lawn Tennis Court 1",
    "sport": "Tennis"
  }
}
```

#### 9. Delete a Court
- **Method:** `DELETE`
- **Path:** `/courts/:courtId` (e.g. `/courts/4`)
- **Response:** `HTTP 200 OK`
```json
{
  "message": "Court deleted successfully"
}
```

---

### C. Reservations APIs

#### 10. Get All Reservations
- **Method:** `GET`
- **Path:** `/reservations`
- **Response:** `HTTP 200 OK`
```json
[
  {
    "reservation_id": 1,
    "player_id": 1,
    "court_id": 1,
    "booking_date": "2026-11-20",
    "time_slot": "09:00 - 10:00",
    "status": "pending"
  }
]
```

#### 11. Get Reservation Details (SQLite JOIN API)
- **Method:** `GET`
- **Path:** `/reservations/details`
- **Description:** Joins `Reservations`, `Players`, and `Courts` tables to show human-readable names.
- **Response:** `HTTP 200 OK`
```json
[
  {
    "reservation_id": 1,
    "player_name": "Rahul Sharma",
    "court_name": "Sunny Lawn Tennis Court 1",
    "sport": "Tennis",
    "booking_date": "2026-11-20",
    "time_slot": "09:00 - 10:00",
    "status": "pending"
  },
  {
    "reservation_id": 2,
    "player_name": "Priya Patel",
    "court_name": "Sunny Indoor Badminton Court A",
    "sport": "Badminton",
    "booking_date": "2026-11-20",
    "time_slot": "10:00 - 11:00",
    "status": "approved"
  }
]
```

#### 12. Add a Reservation
- **Method:** `POST`
- **Path:** `/reservations`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "player_id": 1,
  "court_id": 2,
  "booking_date": "2026-11-25",
  "time_slot": "16:00 - 17:00"
}
```
- **Response:** `HTTP 201 Created` *(Note: status is automatically set to `pending`)*
```json
{
  "message": "Reservation created successfully",
  "reservation": {
    "reservation_id": 4,
    "player_id": 1,
    "court_id": 2,
    "booking_date": "2026-11-25",
    "time_slot": "16:00 - 17:00",
    "status": "pending"
  }
}
```

---

## ⚡ Special Requirement: Reservation Status Flow

Every reservation follows a strict lifecycle:
```
[ pending ] ──(PATCH /status: approved)──> [ approved ] ──(PATCH /status: done)──> [ done ]
```

### Transition Rules:
1. **`pending` → `approved`** : Allowed (`HTTP 200 OK`)
2. **`approved` → `done`** : Allowed (`HTTP 200 OK`)
3. **Any other transition** (skipping, moving backward, re-approving) is **strictly rejected**:
   - `pending` → `done` : Rejected (`HTTP 400 Bad Request`)
   - `approved` → `pending` : Rejected (`HTTP 400 Bad Request`)
   - `done` → `approved` : Rejected (`HTTP 400 Bad Request`)

### Endpoint Details:
- **Method:** `PATCH`
- **Path:** `/reservations/:id/status`

#### Example A: Allowed Transition (pending → approved)
- **Request:** `PATCH /reservations/1/status`
- **Body:** `{"status": "approved"}`
- **Response:** `HTTP 200 OK`
```json
{
  "message": "Reservation status updated successfully",
  "reservation_id": 1,
  "status": "approved"
}
```

#### Example B: Allowed Transition (approved → done)
- **Request:** `PATCH /reservations/2/status`
- **Body:** `{"status": "done"}`
- **Response:** `HTTP 200 OK`
```json
{
  "message": "Reservation status updated successfully",
  "reservation_id": 2,
  "status": "done"
}
```

#### Example C: Invalid Transition (done → approved)
- **Request:** `PATCH /reservations/3/status`
- **Body:** `{"status": "approved"}`
- **Response:** `HTTP 400 Bad Request`
```json
{
  "error": "Invalid status change"
}
```

---

## 🧪 Automated Testing & Postman Instructions

### 1. Running the Automated Test Suite
You can test the entire backend with a single command:
```bash
npm test
```
This runs `test_api.js`, which executes all 33 unit and integration checks, including:
- Players CRUD & duplicate email checks
- Courts CRUD & sport filtering
- Reservations creation with foreign key checks
- Relational JOIN validation
- Valid status transitions (`pending` → `approved`, `approved` → `done`)
- All invalid status transitions verifying `HTTP 400` with `"Invalid status change"`

### 2. Testing with Postman
A complete, pre-configured Postman collection is included in the project:
**File:** `SunnyCourts_Club_API.postman_collection.json`

#### Steps to Import and Test in Postman:
1. Open the **Postman** desktop application.
2. Click the **Import** button (top left).
3. Select or drag-and-drop `SunnyCourts_Club_API.postman_collection.json`.
4. Ensure your server is running (`npm start` on `http://localhost:3000`).
5. Open the imported collection: **SunnyCourts Club – Court Booking Management System**.
6. Click **Run Collection** or execute the 14 individual requests in sequence:
   - Request 1: Get all players
   - Request 2: Add a player
   - Request 3: Get all courts
   - Request 4: Get one court
   - Request 5: Add a court
   - Request 6: Update a court
   - Request 7: Delete a court
   - Request 8: Search courts by sport (`GET /courts?sport=cricket`)
   - Request 9: Add a reservation (default status: `pending`)
   - Request 10: Get all reservations
   - Request 11: Get reservation details using JOIN (`GET /reservations/details`)
   - Request 12: Change `pending` → `approved` (`HTTP 200`)
   - Request 13: Change `approved` → `done` (`HTTP 200`)
   - Request 14: Test invalid status changes (`HTTP 400` with `"Invalid status change"`)

---

## 📤 GitHub Submission Guide

Follow these simple steps to push your project to GitHub:

### 1. Initialize Git Repository
In your project directory terminal, run:
```bash
git init
```

### 2. Add Files to Staging
Ensure `.gitignore` is present (so `node_modules` is not committed):
```bash
git add .
```

### 3. Commit Your Changes
```bash
git commit -m "feat: complete SunnyCourts Club backend with SQLite and Express"
```

### 4. Create a New Repository on GitHub
1. Log in to [GitHub](https://github.com/).
2. Click **New Repository** (green button).
3. Name it: `sunnycourts-backend` (or your preferred name).
4. Leave "Initialize this repository with a README" **unchecked**.
5. Click **Create repository**.

### 5. Link and Push to GitHub
Copy the commands provided by GitHub (replace `<YOUR_USERNAME>` with your GitHub username):
```bash
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/sunnycourts-backend.git
git push -u origin main
```

---

## 🎓 Evaluation Cheat Sheet (For Viva / Demo)

| Concept | Where it is implemented in this project |
| :--- | :--- |
| **Express Middleware** | `express.json()` in [app.js](file:///app.js) to parse incoming JSON bodies |
| **Path Parameters** | `:playerId`, `:courtId`, `:reservationId`, `:id` in route files |
| **Query Parameters** | `req.query.sport` in [routes/courts.js](file:///routes/courts.js) for filtering |
| **SQLite Connection** | `open()` from `sqlite` and `sqlite3.Database` in [config/database.js](file:///config/database.js) |
| **Foreign Keys** | `PRAGMA foreign_keys = ON;` in SQLite connection and SQL constraints |
| **`db.all()`** | Fetching multiple rows (e.g. `GET /players`, `GET /courts`, `GET /reservations/details`) |
| **`db.get()`** | Fetching single row by primary key (e.g. `GET /players/:id`) |
| **`db.run()`** | Insert, update, and delete operations (`POST`, `PUT`, `DELETE`, `PATCH`) |
| **`db.exec()`** | Running multi-statement DDL in [database/init.sql](file:///database/init.sql) |
| **Relational JOIN** | `INNER JOIN Players` and `Courts` in `GET /reservations/details` |
| **State Machine** | Strict validation in `PATCH /reservations/:id/status` enforcing one-step flow |

---

## 👥 Contributors
- **SunnyCourts Club Assignment Team** – Backend Development Engineering Group
