/* For SQL */

import mysql from "mysql2/promise";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Create a pool for managing connections
const pool = mysql.createPool({
  user: process.env.DB_USER, // Database username
  host: process.env.DB_HOST, // Database host (localhost if running locally)
  database: process.env.DB_DATABASE, // Database name
  password: process.env.DB_PASSWORD, // Database password
  port: process.env.DB_PORT, // Default PostgreSQL port
});

export default pool;
