import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

// Create connection pool
export const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// Handle pool errors
pool.on("connect", () => {
  console.log("✅ Connected to PostgreSQL");
});

pool.on("error", (err) => {
  console.error("❌ Unexpected error on PostgreSQL", err);
});

// Test database connection on startup
export const testConnection = async () => {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("✅ Database connection test passed at:", result.rows[0].now);
  } catch (error) {
    console.error("❌ Database connection test failed:", error.message);
    console.error("Check your PostgreSQL credentials in .env file");
    process.exit(1);
  }
};
