const express = require("express");
const router = express.Router();
const {
  uploadImage,
  getMessages,
  sendMessage
} = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/:userId", getMessages);
router.post("/:userId", uploadImage.single("image"), sendMessage);

module.exports = router;
