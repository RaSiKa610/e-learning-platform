const Message = require("../models/Message");
const Follow = require("../models/Follow");
const Enrollment = require("../models/Enrollment");
const StudyMaterial = require("../models/StudyMaterial");
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");

// Multer setup for image uploads in chat
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

exports.uploadImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB
});

// Helper: verify mutual follow
async function areMutualFollows(userAId, userBId) {
  const aFollowsB = await Follow.findOne({
    follower: userAId,
    following: userBId,
    status: "accepted"
  });
  const bFollowsA = await Follow.findOne({
    follower: userBId,
    following: userAId,
    status: "accepted"
  });
  return !!(aFollowsB && bFollowsA);
}

// GET /api/messages/:userId  – get conversation with a user
exports.getMessages = async (req, res) => {
  try {
    const otherUserId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const mutual = await areMutualFollows(req.user._id, otherUserId);

    if (!mutual) {
      return res.status(403).json({ message: "You must mutually follow each other to view messages" });
    }

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: otherUserId },
        { sender: otherUserId, receiver: req.user._id }
      ]
    })
      .populate("sender", "name")
      .populate("receiver", "name")
      .populate({
        path: "studyMaterial",
        select: "title type url fileType courseId"
      })
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/messages/:userId  – send a message
exports.sendMessage = async (req, res) => {
  try {
    const receiverId = req.params.userId;
    const { text, studyMaterialId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    if (studyMaterialId && !mongoose.Types.ObjectId.isValid(studyMaterialId)) {
      return res.status(400).json({ message: "Invalid studyMaterialId" });
    }

    const mutual = await areMutualFollows(req.user._id, receiverId);

    if (!mutual) {
      return res.status(403).json({ message: "You must mutually follow each other to send messages" });
    }

    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    // Validate study material sharing
    let studyMaterial = null;
    if (studyMaterialId) {
      const mat = await StudyMaterial.findById(studyMaterialId);
      if (!mat) {
        return res.status(404).json({ message: "Study material not found" });
      }

      // Check if receiver is enrolled in the course
      const receiverEnrolled = await Enrollment.findOne({
        userId: receiverId,
        courseId: mat.courseId
      });

      if (!receiverEnrolled) {
        return res.status(403).json({
          message: "The recipient is not enrolled in this course, so you cannot share this study material"
        });
      }

      studyMaterial = studyMaterialId;
    }

    if (!text && !imageUrl && !studyMaterial) {
      return res.status(400).json({ message: "Message must have text, an image, or a study material" });
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      text: text || "",
      imageUrl,
      studyMaterial
    });

    const populated = await message.populate([
      { path: "sender", select: "name" },
      { path: "receiver", select: "name" },
      { path: "studyMaterial", select: "title type url fileType courseId" }
    ]);

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
