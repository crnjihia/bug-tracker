const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Determine the database file path
const dbPath = path.resolve(__dirname, "database.db");

// Create/connect to database
const db = new sqlite3.Database(
  dbPath,
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
    if (err) {
      console.error("Database connection error:", err.message);
    } else {
      console.log("Connected to SQLite database");
    }
  }
);

// Initialize tables
const initDb = () => {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS bugs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'Open',
      priority TEXT DEFAULT 'Medium',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_by INTEGER NOT NULL,
      assigned_to INTEGER,
      FOREIGN KEY(created_by) REFERENCES users(id),
      FOREIGN KEY(assigned_to) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bug_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(bug_id) REFERENCES bugs(id),
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    console.log("Database tables initialized");
  });
};

// Export the database connection and init function
module.exports = { db, initDb };
