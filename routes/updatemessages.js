import express from "express";

import pool from "../db.js";

const router = express.Router();

router.post("/updatemessages", async (req, res) => {
  const { id, userName, message_text, file_text, file_fileId } = req.body;

  try {
    await pool.query(
      "INSERT INTO ?? (message, file_name, file_id) VALUES (?, ?, ?)",
      [userName, message_text, file_text, file_fileId]
    );
    console.log("Message updated");
    res.json({ message: "Insert complete" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
