const path = require("path");
const multer = require("multer");
const mongoose = require("mongoose");
const StudyMaterial = require("../models/StudyMaterial");
const Enrollment = require("../models/Enrollment");

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    "application/pdf",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "video/mp4",
    "video/webm",
    "video/ogg"
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type"), false);
  }
};

exports.upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 } // 100 MB
});

// GET /api/study-materials?courseId=...
exports.getMaterials = async (req, res) => {
  try {
    const { courseId } = req.query;
    if (!courseId) {
      return res.status(400).json({ message: "courseId is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid courseId" });
    }

    // If the user is not an admin, check enrollment
    if (req.user.role !== "admin") {
      const enrolled = await Enrollment.findOne({
        userId: req.user._id,
        courseId
      });
      if (!enrolled) {
        return res.status(403).json({ message: "You must be enrolled in this course to view materials" });
      }
    }

    const materials = await StudyMaterial.find({ courseId }).sort({ createdAt: -1 });
    res.json(materials);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/study-materials  (admin only)
exports.addMaterial = async (req, res) => {
  try {
    const { courseId, title, type, url, fileType } = req.body;

    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid courseId" });
    }

    let finalUrl = url;
    let finalFileType = fileType;

    // If a file was uploaded, build the URL from the saved file
    if (req.file) {
      finalUrl = `/uploads/${req.file.filename}`;
      finalFileType = req.file.originalname.split(".").pop().toLowerCase();
    }

    if (!finalUrl) {
      return res.status(400).json({ message: "A file or URL is required" });
    }

    const material = await StudyMaterial.create({
      courseId,
      title,
      type,
      url: finalUrl,
      fileType: finalFileType,
      uploadedBy: req.user._id
    });

    res.status(201).json(material);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/study-materials/:id  (admin only)
exports.deleteMaterial = async (req, res) => {
  try {
    const material = await StudyMaterial.findByIdAndDelete(req.params.id);
    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }
    res.json({ message: "Material deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
