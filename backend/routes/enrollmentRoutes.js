const express = require("express");
const router = express.Router();
const {
  enrollInCourse,
  getMyEnrollments,
  updateProgress,
  unenrollFromCourse
} = require("../controllers/enrollmentController");

const { protect } = require("../middleware/authMiddleware");

router.post("/enroll", protect, enrollInCourse);
router.get("/me", protect, getMyEnrollments);
router.put("/:id/progress", protect, updateProgress);
router.delete("/:id/unenroll", protect, unenrollFromCourse);

module.exports = router;
