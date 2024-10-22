import express from "express";

import pool from "../db.js";

const router = express.Router();

router.get("/users", async (req, res) => {
  try {
    const [result] = await pool.query("SELECT * FROM userbase");
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database query failed" });
  }
});

export default router;
