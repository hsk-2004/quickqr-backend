import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import qrRoutes from "./routes/qr.routes.js";

dotenv.config();

const app = express();

/* =======================
   ✅ CORS CONFIG (PRODUCTION READY)
   ======================= */

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://quickqr.harmanxdev.fun"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
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
  res.send("QuickQR Backend is running 🚀");
});

/* =======================
   START SERVER
   ======================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at /api`);
});
