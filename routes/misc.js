import express from "express";

import pool from "../db.js";

const router = express.Router();

router.get("/users", async (req, res) => {
  res.send("Why you trying to hack my database :(");
});

export default router;
