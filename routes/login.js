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
    // Query the database to find the user by ID
    const [rows] = await pool.query(
      "SELECT * FROM userbase WHERE username = ?",
      [username]
    );

    if (rows.length === 0) {
      return res.json({
        error: 1,
        status: "Invalid username and password combination",
      });
    }

    //Fetched user
    user = rows[0];

    if (password !== user.password) {
      return res.json({
        error: 2,
        status: "Invalid username and password combination",
      });
    }

    // Generate JWT token
    token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });

    // return res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "Server error" });
  }

  res.json({
    error: 0,
    status: "Login successful",
    id: user.id,
    token,
  });

  // try {
  //   const [messages] = await pool.query("SELECT * FROM ?? ", [username]);

  //   let messagesArr = [];
  //   messages.forEach((row, index) => {
  //     // console.log(row.item_fileid);
  //     const messageObj = {
  //       text: row.message,
  //       fileItem: {
  //         fileName: row.file_name,
  //         fileId: row.file_id,
  //       },
  //     };
  //     messagesArr.push(messageObj);
  //   });

  //   // Send success response
  //   res.json({
  //     status: "Login successful",
  //     messagesData: messagesArr,
  //     id: user.id,
  //     token,
  //   });
  // } catch (error) {
  //   console.log(error);
  // }
});

export default router;
