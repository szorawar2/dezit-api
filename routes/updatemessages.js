import express from "express";

import pool from "../db.js";

const router = express.Router();

router.post("/updatemessages", async (req, res) => {
  const { id, message_text, file_text, file_driveId } = req.body;

  try {
    await pool.query(
      "INSERT INTO userdata (user_id, item_message, item_filename, item_fileid) VALUES (?, ?, ?, ?)",
      [id, message_text, file_text, file_driveId]
    );
    console.log("Message updated");
    res.json({ message: "Insert complete" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// router.get("/updatemessages", async (req, res) => {
//   res.json({ Bruh: "yo" });
// });

export default router;
