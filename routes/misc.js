import express from "express";

import pool from "../db.js";

const router = express.Router();

router.get("/users", async (req, res) => {
  res.send("Why you trying to hack my database :(");
});

router.get("/test", async (reqq, res) => {
  res.send("Auto deploy test");
});

// router.get("/db", async (req, res) => {
//   try {
//     const result = await pool.query(`
//       SELECT table_name
//       FROM information_schema.tables
//       WHERE table_schema = 'public'
//         AND table_type = 'BASE TABLE';
//     `);

//     const tables = result.rows.map((row) => row.table_name);
//     console.log("Tables in the database:", tables);
//     res.json({ tables });
//   } catch (error) {
//     console.error("Error fetching tables:", error);
//     res.status(500).json({ error: "Failed to retrieve tables" });
//   }
// });

// router.get("/test-userbase", async (req, res) => {
//   try {
//     const result = await pool.query("SELECT * FROM userbase");
//     console.log("userbase rows:", result.rows);
//     res.json({ users: result.rows });
//   } catch (error) {
//     console.error("Error querying userbase:", error);
//     res.status(500).json({ error: "Failed to retrieve userbase data" });
//   }
// });

export default router;
