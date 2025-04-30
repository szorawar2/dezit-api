import express from "express";
import pool from "../db.js";

const router = express.Router();

router.post("/updatemessages", async (req, res) => {
  const { id, message_text, file_text, file_Id } = req.body;

  try {
    await pool.query(
      `INSERT INTO messages (user_id, message, file_name, file_id)
       VALUES ($1, $2, $3, $4)`,
      [id, message_text, file_text, file_Id]
    );

    console.log(`Message inserted for user ID: ${id}`);
    res.json({ message: "Insert complete" });
  } catch (error) {
    console.error("Error inserting message:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
