import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import pool from "../db.js";

const router = express.Router();

router.post("/load_chats", async (req, res) => {
  const { username, token } = req.body;

  if (token) {
    try {
      const [messages] = await pool.query("SELECT * FROM ?? ", [username]);

      let messagesArr = [];
      messages.forEach((row, index) => {
        const messageObj = {
          text: row.message,
          fileItem: {
            fileName: row.file_name,
            fileId: row.file_id,
          },
        };
        messagesArr.push(messageObj);
      });

      // Send success response
      res.json({
        error: 0,
        status: "Messages fetched",
        messagesData: messagesArr,
      });
    } catch (error) {
      console.log(error);
    }
  } else {
    res.json({
      error: 1,
      status: "Unable to fetch messages",
    });
  }
});

export default router;
