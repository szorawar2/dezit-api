import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import pool from "../db.js";

const router = express.Router();

const SECRET_KEY = "your_secret_key"; // Define your secret key here

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  let user;
  let token;

  try {
    // Query the database to find the user by username
    const result = await pool.query(
      "SELECT * FROM userbase WHERE username = $1",
      [username]
    );

    if (result.rows.length === 0) {
      return res.json({
        error: 1,
        status: "Invalid username and password combination",
      });
    }

    // Fetched user
    user = result.rows[0];

    //Wrong password
    if (password !== user.password) {
      return res.json({
        error: 2,
        status: "Invalid username and password combination",
      });
    }

    // Generate JWT token
    token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "Server error" });
  }

  // return user id & token;
  res.json({
    error: 0,
    status: "Login successful",
    id: user.id,
    token,
  });
});

export default router;
