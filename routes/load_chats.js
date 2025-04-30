import express from "express";
import pool from "../db.js";

const router = express.Router();

router.post("/load_chats", async (req, res) => {
  const { username, token } = req.body;

  if (token) {
    try {
      // Fetch the user ID based on the username
      const userResult = await pool.query(
        "SELECT id FROM userbase WHERE username = $1",
        [username]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 1, status: "User not found" });
      }

      const userId = userResult.rows[0].id;

      // Fetch messages for the user
      const result = await pool.query(
        "SELECT id, message, file_name, file_id, time_of_message FROM messages WHERE user_id = $1",
        [userId]
      );

      let messagesArr = [];
      result.rows.forEach((row) => {
        const messageObj = {
          id: row.id,
          text: row.message,
          fileItem: {
            fileName: row.file_name,
            fileId: row.file_id,
          },
          time: row.time_of_message,
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
      res.status(500).json({ error: 1, status: "Database error" });
    }
  } else {
    res.json({
      error: 1,
      status: "Unable to fetch messages",
    });
  }
});

export default router;
