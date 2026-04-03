const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const Notification = require("../models/Notification");
const mongoose = require("mongoose");

// POST /api/enroll
exports.enrollInCourse = async (req, res) => {
  const { courseId } = req.body;

  if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
    return res.status(400).json({ message: "Invalid courseId" });
  }

  const alreadyEnrolled = await Enrollment.findOne({
    userId: req.user._id,
    courseId
  });

  if (alreadyEnrolled) {
    return res.status(400).json({ message: "Already enrolled" });
  }

  const course = await Course.findById(courseId).select("title");

  const enrollment = await Enrollment.create({
    userId: req.user._id,
    courseId
  });

  // Create enrollment notification for the user
  await Notification.create({
    user: req.user._id,
    type: "enrolled",
    message: `You have successfully enrolled in "${course ? course.title : "a course"}"`,
    relatedCourse: courseId
  });

  res.status(201).json(enrollment);
};

// GET /api/enrollments/me
exports.getMyEnrollments = async (req, res) => {
  const enrollments = await Enrollment.find({
    userId: req.user._id
  }).populate("courseId");

  res.json(enrollments);
};

// PUT /api/enrollments/:id/progress
exports.updateProgress = async (req, res) => {
  const { lessonId, completed } = req.body;

  const enrollment = await Enrollment.findById(req.params.id);

  if (!enrollment) {
    return res.status(404).json({ message: "Enrollment not found" });
  }

  enrollment.progress.set(lessonId, completed);

  const total = enrollment.progress.size;
  const done = Array.from(enrollment.progress.values()).filter(Boolean).length;

  enrollment.progressPercent = total === 0 ? 0 : Math.round((done / total) * 100);

  if (enrollment.progressPercent === 100) {
    enrollment.completedAt = new Date();
  }

  await enrollment.save();
  res.json(enrollment);
};

// DELETE /api/enrollments/:id/unenroll
exports.unenrollFromCourse = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id).populate("courseId", "title");

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    if (enrollment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const courseTitle = enrollment.courseId ? enrollment.courseId.title : "a course";

    await Enrollment.findByIdAndDelete(req.params.id);

    // Create unenrollment notification
    await Notification.create({
      user: req.user._id,
      type: "unenrolled",
      message: `You have unenrolled from "${courseTitle}"`,
      relatedCourse: enrollment.courseId ? enrollment.courseId._id : null
    });

    res.json({ message: "Unenrolled successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
