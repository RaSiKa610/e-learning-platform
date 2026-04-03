const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  contentHtml: String,
  videoUrl: String,
  order: Number
});

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    category: { type: String, default: "" },
    price: { type: Number, default: 0 },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner"
    },
    lessons: [lessonSchema],
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
