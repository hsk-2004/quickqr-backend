import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

// 🔥 Neon-compatible connection pool
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // REQUIRED for Neon
  },
});

// Log successful connection
pool.on("connect", () => {
  console.log("✅ Connected to Neon PostgreSQL");
});

// Handle pool errors
pool.on("error", (err) => {
  console.error("❌ PostgreSQL pool error:", err);
});

// Test database connection on startup
export const testConnection = async () => {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("✅ Database connection test passed at:", result.rows[0].now);
  } catch (error) {
    console.error("❌ Database connection test failed:", error.message);
    process.exit(1);
  }
};
