import express from "express";

import pool from "../db.js";

const router = express.Router();

router.get("/users", async (req, res) => {
  res.send("Why you trying to hack my database :(");
});

router.get("/test", async (reqq, res) => {
  res.send("Auto deploy test");
});

export default router;
