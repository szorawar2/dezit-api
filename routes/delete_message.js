import express from "express";
import pool from "../db.js";
import { deleteFile } from "../fs.js"; // Updated import

const router = express.Router();

router.delete("/delete_message", async (req, res) => {
  const { username, id } = req.body;

  try {
    const result = await pool.query("SELECT * FROM messages WHERE id = $1", [
      id,
    ]);

    if (result.rows.length > 0) {
      const filePath = `${username}/${result.rows[0].file_id}`;
      try {
        // Delete file from storage if file_id exists
        if (result.rows[0].file_id) {
          await deleteFile(filePath);
        }

        // Delete message from database
        await pool.query("DELETE FROM messages WHERE id = $1", [id]);

        res.json({ error: 0, status: "Message deleted successfully" });
      } catch (error) {
        console.error("Error deleting message:", error);
        res.json({ error: 1, status: "Failed to delete message" });
      }
    } else {
      res.json({ error: 1, status: "Message not found" });
    }
  } catch (error) {
    console.error(error);
    res.json({ error: 1, status: "Database error" });
  }
});

export default router;
