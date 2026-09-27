const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sqlite3 = require("sqlite3").verbose();
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();
const PORT = 8000;
const JWT_SECRET = "my_secure_jwt_secret_123";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

const db = new sqlite3.Database("users.db");

// Create users table
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )
`);

// Register
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Name, email and password are required"
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword],
      function (err) {
        if (err) {
          if (err.message.includes("UNIQUE")) {
            return res.status(400).json({
              message: "Email already registered"
            });
          }

          return res.status(500).json({
            message: "Registration failed"
          });
        }

        res.status(201).json({
          message: "Registration successful",
          userId: this.lastID
        });
      }
    );
  } catch (error) {
    res.status(500).json({
      message: "Server error"
    });
  }
});

// Login
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required"
    });
  }

  db.get(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, user) => {
      if (err) {
        return res.status(500).json({
          message: "Database error"
        });
      }

      if (!user) {
        return res.status(401).json({
          message: "Invalid email or password"
        });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.status(401).json({
          message: "Invalid email or password"
        });
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email
        },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 60 * 60 * 1000
      });

      res.json({
        message: "Login successful"
      });
    }
  );
});

// JWT middleware
function authenticateToken(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      message: "Authentication required"
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        message: "Invalid or expired token"
      });
    }

    req.user = user;
    next();
  });
}

// Protected route
app.get("/api/profile", authenticateToken, (req, res) => {
  db.get(
    "SELECT id, name, email FROM users WHERE id = ?",
    [req.user.id],
    (err, user) => {
      if (err || !user) {
        return res.status(404).json({
          message: "User not found"
        });
      }

      res.json({
        message: "Protected profile data",
        user: user
      });
    }
  );
});

// Logout
app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token");
  res.json({
    message: "Logout successful"
  });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
