require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { db, initDb } = require("./database");

const app = express();
app.use(bodyParser.json());
app.use(cors());

initDb();

// Database initialization
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT DEFAULT 'user'
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS bugs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      description TEXT,
      status TEXT DEFAULT 'Open',
      priority TEXT DEFAULT 'Medium',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_by INTEGER,
      assigned_to INTEGER,
      FOREIGN KEY(created_by) REFERENCES users(id),
      FOREIGN KEY(assigned_to) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bug_id INTEGER,
      user_id INTEGER,
      content TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(bug_id) REFERENCES bugs(id),
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS bug_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bug_id INTEGER,
      changed_field TEXT,
      old_value TEXT,
      new_value TEXT,
      changed_by INTEGER,
      changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(bug_id) REFERENCES bugs(id),
      FOREIGN KEY(changed_by) REFERENCES users(id)
    )
  `);
});

// Auth middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token)
    return res.status(401).json({ message: "Authentication required" });

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Helper function to log bug changes
const logBugChange = (bugId, field, oldValue, newValue, userId) => {
  db.run(
    "INSERT INTO bug_history (bug_id, changed_field, old_value, new_value, changed_by) VALUES (?, ?, ?, ?, ?)",
    [bugId, field, oldValue, newValue, userId]
  );
};

// User routes
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [username, hashedPassword],
      function (err) {
        if (err) {
          if (err.message.includes("UNIQUE constraint failed")) {
            return res.status(400).json({ message: "Username already exists" });
          }
          return res.status(500).json({ message: "Database error" });
        }
        res.status(201).json({
          id: this.lastID,
          username,
          message: "Registration successful",
        });
      }
    );
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  db.get(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, user) => {
      if (err || !user)
        return res.status(401).json({ message: "Invalid credentials" });

      const valid = await bcrypt.compare(password, user.password);
      if (!valid)
        return res.status(401).json({ message: "Invalid credentials" });

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "1h" }
      );

      res.json({
        token,
        user: { id: user.id, username: user.username, role: user.role },
      });
    }
  );
});

// Bug routes
app.get("/api/bugs", authenticate, (req, res) => {
  const { status, priority, search, assignedTo } = req.query;
  let query = `
    SELECT b.*, 
      uc.username as created_by_username, 
      ua.username as assigned_to_username 
    FROM bugs b
    LEFT JOIN users uc ON b.created_by = uc.id
    LEFT JOIN users ua ON b.assigned_to = ua.id
    WHERE 1=1
  `;
  const params = [];

  if (status) {
    query += " AND b.status = ?";
    params.push(status);
  }
  if (priority) {
    query += " AND b.priority = ?";
    params.push(priority);
  }
  if (assignedTo) {
    query += " AND b.assigned_to = ?";
    params.push(assignedTo);
  }
  if (search) {
    query += " AND (b.title LIKE ? OR b.description LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }

  query += " ORDER BY b.updated_at DESC";

  db.all(query, params, (err, bugs) => {
    if (err) return res.status(500).json({ message: "Server error" });
    res.json(bugs);
  });
});

app.get("/api/bugs/:id", authenticate, (req, res) => {
  const query = `
    SELECT b.*, 
      uc.username as created_by_username, 
      ua.username as assigned_to_username 
    FROM bugs b
    LEFT JOIN users uc ON b.created_by = uc.id
    LEFT JOIN users ua ON b.assigned_to = ua.id
    WHERE b.id = ?
  `;
  db.get(query, [req.params.id], (err, bug) => {
    if (err) return res.status(500).json({ message: "Server error" });
    if (!bug) return res.status(404).json({ message: "Bug not found" });
    res.json(bug);
  });
});

app.post("/api/bugs", authenticate, (req, res) => {
  const { title, description, priority, assigned_to } = req.body;
  if (!title) return res.status(400).json({ message: "Title is required" });

  db.run(
    "INSERT INTO bugs (title, description, priority, created_by, assigned_to) VALUES (?, ?, ?, ?, ?)",
    [
      title,
      description,
      priority || "Medium",
      req.user.id,
      assigned_to || null,
    ],
    function (err) {
      if (err) return res.status(500).json({ message: "Server error" });

      db.get(
        `SELECT b.*, uc.username as created_by_username, ua.username as assigned_to_username 
         FROM bugs b
         LEFT JOIN users uc ON b.created_by = uc.id
         LEFT JOIN users ua ON b.assigned_to = ua.id
         WHERE b.id = ?`,
        [this.lastID],
        (err, bug) => {
          if (err) return res.status(500).json({ message: "Server error" });
          res.status(201).json(bug);
        }
      );
    }
  );
});

app.patch("/api/bugs/:id", authenticate, (req, res) => {
  const { title, description, status, priority, assigned_to } = req.body;

  // First get the current bug state
  db.get("SELECT * FROM bugs WHERE id = ?", [req.params.id], (err, bug) => {
    if (err) return res.status(500).json({ message: "Server error" });
    if (!bug) return res.status(404).json({ message: "Bug not found" });

    // Prepare update query
    const updates = [];
    const params = [];

    if (title !== undefined) {
      updates.push("title = ?");
      params.push(title);
      logBugChange(bug.id, "title", bug.title, title, req.user.id);
    }
    if (description !== undefined) {
      updates.push("description = ?");
      params.push(description);
      logBugChange(
        bug.id,
        "description",
        bug.description,
        description,
        req.user.id
      );
    }
    if (status !== undefined) {
      updates.push("status = ?");
      params.push(status);
      logBugChange(bug.id, "status", bug.status, status, req.user.id);
    }
    if (priority !== undefined) {
      updates.push("priority = ?");
      params.push(priority);
      logBugChange(bug.id, "priority", bug.priority, priority, req.user.id);
    }
    if (assigned_to !== undefined) {
      updates.push("assigned_to = ?");
      params.push(assigned_to);
      logBugChange(
        bug.id,
        "assigned_to",
        bug.assigned_to,
        assigned_to,
        req.user.id
      );
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    updates.push("updated_at = CURRENT_TIMESTAMP");
    params.push(req.params.id);

    const query = `UPDATE bugs SET ${updates.join(", ")} WHERE id = ?`;

    db.run(query, params, function (err) {
      if (err) return res.status(500).json({ message: "Server error" });

      // Return the updated bug
      db.get(
        `SELECT b.*, uc.username as created_by_username, ua.username as assigned_to_username 
         FROM bugs b
         LEFT JOIN users uc ON b.created_by = uc.id
         LEFT JOIN users ua ON b.assigned_to = ua.id
         WHERE b.id = ?`,
        [req.params.id],
        (err, updatedBug) => {
          if (err) return res.status(500).json({ message: "Server error" });
          res.json(updatedBug);
        }
      );
    });
  });
});

app.delete("/api/bugs/:id", authenticate, (req, res) => {
  db.run("DELETE FROM bugs WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ message: "Server error" });
    if (this.changes === 0)
      return res.status(404).json({ message: "Bug not found" });
    res.json({ success: true });
  });
});

// Comment routes
app.get("/api/bugs/:id/comments", authenticate, (req, res) => {
  const query = `
    SELECT c.*, u.username 
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.bug_id = ?
    ORDER BY c.created_at DESC
  `;
  db.all(query, [req.params.id], (err, comments) => {
    if (err) return res.status(500).json({ message: "Server error" });
    res.json(comments);
  });
});

app.post("/api/bugs/:id/comments", authenticate, (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ message: "Content is required" });

  db.run(
    "INSERT INTO comments (bug_id, user_id, content) VALUES (?, ?, ?)",
    [req.params.id, req.user.id, content],
    function (err) {
      if (err) return res.status(500).json({ message: "Server error" });

      db.get(
        "SELECT c.*, u.username FROM comments c JOIN users u ON c.user_id = u.id WHERE c.id = ?",
        [this.lastID],
        (err, comment) => {
          if (err) return res.status(500).json({ message: "Server error" });
          res.status(201).json(comment);
        }
      );
    }
  );
});

// History routes
app.get("/api/bugs/:id/history", authenticate, (req, res) => {
  const query = `
    SELECT h.*, u.username as changed_by_username
    FROM bug_history h
    JOIN users u ON h.changed_by = u.id
    WHERE h.bug_id = ?
    ORDER BY h.changed_at DESC
  `;
  db.all(query, [req.params.id], (err, history) => {
    if (err) return res.status(500).json({ message: "Server error" });
    res.json(history);
  });
});

// User routes
app.get("/api/users", authenticate, (req, res) => {
  db.all("SELECT id, username, role FROM users", (err, users) => {
    if (err) return res.status(500).json({ message: "Server error" });
    res.json(users);
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
