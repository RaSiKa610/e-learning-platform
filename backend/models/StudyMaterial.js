const mongoose = require("mongoose");

const studyMaterialSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ["document", "image", "video", "youtube", "hyperlink"],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    fileType: {
      type: String // e.g. "pdf", "ppt", "doc", "mp4", "jpg", etc.
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudyMaterial", studyMaterialSchema);
