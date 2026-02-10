import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

// 🟢 PostgreSQL connection using DATABASE_URL
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Log successful connection
pool.on("connect", () => {
  console.log("✅ Connected to Local PostgreSQL");
});

// Handle pool errors
pool.on("error", (err) => {
  console.error("❌ PostgreSQL pool error:", err);
});

// Test database connection on startup
export const testConnection = async () => {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log(
      "✅ Database connection test passed at:",
      result.rows[0].now
    );
  } catch (error) {
    console.error("❌ Database connection test failed:", error.message);
    process.exit(1);
  }
};
