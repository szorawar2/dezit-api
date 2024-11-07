import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import { s3CreateFolder } from "../s3.js";
import pool from "../db.js";

const router = express.Router();

const SECRET_KEY = "your_secret_key"; // Define your secret key here

router.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  let userID;

  //Check if user exists
  try {
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

  //Password must be atleast 8 characters long and must not include space
  if (password.length < 8 || password.includes(" ")) {
    return res.json({ error: 2, message: "Enter a valid password" });
  }

  //Add new user to userbase table in database
  try {
    await pool.query(
      "INSERT INTO userbase (username, password) VALUES (?, ?)",
      [username, password]
    );

    //Create user data folder on s3 storage
    s3CreateFolder(username);
  } catch (error) {
    console.log(error);
  }

  //Send response with the user data
  try {
    const [result] = await pool.query(
      "SELECT * FROM userbase WHERE username = ?",
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
