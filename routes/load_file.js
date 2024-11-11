import express from "express";
import path from "path";

import pool from "../db.js";
import { s3DownloadFile } from "../s3.js";

const router = express.Router();

router.get("/load_file", async (req, res) => {
  const { userId, fileId } = req.query;
  // const fileDetail = `${userID}_${message_index}_${fileName}`;
  // const filePath = path.resolve("../uploads", fileDetail);
  console.log(fileId);
  let userName;

  if (!fileId) {
    return res.status(400).json({ error: "File ID is required" });
  }

  //Get username from userID
  try {
    const [rows] = await pool.query("SELECT * FROM userbase WHERE id = ?", [
      userId,
    ]);
    if (rows.length == 0) {
      return res.json("unexpected error");
    }
    userName = rows[0].username;
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }

  // Call the googleDownloadFile function and pass the response object
  await s3DownloadFile(userName, fileId, res);
});

export default router;
