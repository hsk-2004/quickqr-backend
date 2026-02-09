import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import qrRoutes from "./routes/qr.routes.js";
import { testConnection } from "./db.js";

dotenv.config();

const app = express();

/* =======================
   ✅ CORS CONFIG (DEV SAFE)
   Allows localhost on ANY port
   ======================= */
app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (Postman, curl, mobile apps)
      if (!origin) return callback(null, true);

      // allow any localhost port (5173, 5174, etc.)
      if (origin.startsWith("http://localhost")) {
        return callback(null, true);
      }

      // block everything else
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

/* =======================
   MIDDLEWARE
   ======================= */
app.use(express.json());

/* =======================
   ROUTES
   ======================= */
app.use("/api/auth", authRoutes);
app.use("/api/qr", qrRoutes);

/* =======================
   HEALTH CHECK
   ======================= */
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is running",
    timestamp: new Date().toISOString(),
  });
});

/* =======================
   ROOT
   ======================= */
app.get("/", (req, res) => {
  res.send("Backend is running");
});

const PORT = process.env.PORT || 5000;

/* =======================
   START SERVER
   ======================= */
const startServer = async () => {
  try {
    console.log("\n🔄 Testing database connection...");
    await testConnection();

    app.listen(PORT, () => {
      console.log(`\n🚀 Backend running on http://localhost:${PORT}`);
      console.log(`🌍 CORS: localhost ports allowed`);
      console.log(`📡 API: http://localhost:${PORT}/api\n`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
