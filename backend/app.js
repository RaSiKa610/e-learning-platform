const express = require("express");
const cors = require("cors");
const path = require("path");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const studyMaterialRoutes = require("./routes/studyMaterialRoutes");
const followRoutes = require("./routes/followRoutes");
const messageRoutes = require("./routes/messageRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const timetableRoutes = require("./routes/timetableRoutes");

const app = express();

// General API rate limiter: 500 requests per 15 minutes per IP
// (covers chat polling at 5s intervals plus regular navigation)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." }
});

// Stricter limiter for write operations (send message, follow request)
const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please slow down." }
});

app.use(cors());
app.use(express.json());

// Serve uploaded files as static assets
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Apply general rate limiter to all API routes
app.use("/api", apiLimiter);

// routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/study-materials", studyMaterialRoutes);
app.use("/api/follows", followRoutes);
app.use("/api/messages", writeLimiter, messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/timetable", timetableRoutes);

app.get("/", (req, res) => {
  res.send("E-Learning API running");
});

// Multer error handler – converts LIMIT_FILE_SIZE to a friendly message
app.use((err, req, res, next) => {
  if (err && err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ message: "File size exceeds the allowed limit." });
  }
  next(err);
});

module.exports = app;
