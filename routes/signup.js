import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import pool from "../db.js";

const router = express.Router();

const SECRET_KEY = "your_secret_key"; // Define your secret key here

router.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  let userID;

  try {
    // Query the database to find the user by ID
    const [rows] = await pool.query(
      "SELECT * FROM userbase WHERE username = ?",
      [username]
    );

    if (rows.length) {
      return res.json({ error: 1, message: "User already exists" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }

  if (password.length < 8 || password.includes(" ")) {
    return res.json({ error: 2, message: "Enter a valid password" });
  }

  try {
    await pool.query(
      "INSERT INTO userbase (username, password) VALUES (?, ?)",
      [username, password]
    );
  } catch (error) {
    console.log(error);
  }

  try {
    const [result] = await pool.query(
      "SELECT * FROM userbase WHERE username = $1",
      [username]
    );
    userID = result[0].id;
    //console.log(result.rows[0].id);

    // Generate JWT token
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });

    // Send success response
    res.json({
      error: 0,
      id: userID,
      message: "Signup successful",
      token,
    });
  } catch (error) {
    console.log(error);
  }
});

export default router;
