const express = require("express");
const router = express.Router();
const {
  sendFollowRequest,
  acceptFollowRequest,
  rejectFollowRequest,
  getFollowing,
  getFollowers,
  getMutualFollows,
  getAllUsers
} = require("../controllers/followController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/request/:userId", sendFollowRequest);
router.put("/:id/accept", acceptFollowRequest);
router.put("/:id/reject", rejectFollowRequest);
router.get("/following", getFollowing);
router.get("/followers", getFollowers);
router.get("/mutual", getMutualFollows);
router.get("/users", getAllUsers);

module.exports = router;
