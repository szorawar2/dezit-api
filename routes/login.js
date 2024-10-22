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

    user = rows[0];

    // Compare the provided password with the stored hashed password
    // const passwordMatch = bcrypt.compareSync(password, user.password);

    // if (!passwordMatch) {
    //   return res.status(401).json({ message: "Invalid password" });
    // }
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

  try {
    const [messages] = await pool.query(
      "SELECT * FROM userdata WHERE user_id = ?",
      [user.id]
    );

    let messagesArr = [];
    messages.forEach((row, index) => {
      // console.log(row.item_fileid);
      const messageObj = {
        text: row.item_message,
        fileItem: {
          fileName: row.item_filename,
          fileId: row.item_fileid,
        },
      };
      messagesArr.push(messageObj);
    });

    // Send success response
    res.json({
      status: "Login successful",
      messagesData: messagesArr,
      id: user.id,
      token,
    });
  } catch (error) {
    console.log(error);
  }
});

export default router;
