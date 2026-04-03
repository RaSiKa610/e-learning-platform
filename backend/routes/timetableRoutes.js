const express = require("express");
const router = express.Router();
const { generateTimetable } = require("../controllers/timetableController");
const { protect } = require("../middleware/authMiddleware");

router.get("/:courseId", protect, generateTimetable);

module.exports = router;
