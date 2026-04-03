const express = require("express");
const router = express.Router();
const {
  upload,
  getMaterials,
  addMaterial,
  deleteMaterial
} = require("../controllers/studyMaterialController");
const { protect, admin } = require("../middleware/authMiddleware");

// Enrolled users can view materials for a course
router.get("/", protect, getMaterials);

// Admin adds a material (with optional file upload)
router.post("/", protect, admin, upload.single("file"), addMaterial);

// Admin deletes a material
router.delete("/:id", protect, admin, deleteMaterial);

module.exports = router;
