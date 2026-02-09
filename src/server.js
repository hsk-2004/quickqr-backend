import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import { testConnection } from "./db.js";

dotenv.config();

const app = express();

// CORS configuration - allows frontend to make requests
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is running",
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.send("Backend is running");
});

const PORT = process.env.PORT || 5000;

// Start server and test database
const startServer = async () => {
  try {
    console.log("\n🔄 Testing database connection...");
    await testConnection();
    
    app.listen(PORT, () => {
      console.log(`\n🚀 Backend running on http://localhost:${PORT}`);
      console.log(`✅ CORS enabled for ${corsOptions.origin}`);
      console.log(`📡 API endpoints at http://localhost:${PORT}/api\n`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
