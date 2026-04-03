const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const studyMaterialRoutes = require("./routes/studyMaterialRoutes");
const followRoutes = require("./routes/followRoutes");
const messageRoutes = require("./routes/messageRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const timetableRoutes = require("./routes/timetableRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded files as static assets
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/study-materials", studyMaterialRoutes);
app.use("/api/follows", followRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/timetable", timetableRoutes);

app.get("/", (req, res) => {
  res.send("E-Learning API running");
});

module.exports = app;
