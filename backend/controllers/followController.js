const Follow = require("../models/Follow");
const Notification = require("../models/Notification");
const User = require("../models/User");
const mongoose = require("mongoose");

// POST /api/follows/request/:userId  – send a follow request
exports.sendFollowRequest = async (req, res) => {
  try {
    const followingId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(followingId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    if (req.user._id.toString() === followingId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const target = await User.findById(followingId).select("name");
    if (!target) {
      return res.status(404).json({ message: "User not found" });
    }

    const existing = await Follow.findOne({
      follower: req.user._id,
      following: followingId
    });

    if (existing) {
      return res.status(400).json({ message: "Follow request already sent or you already follow this user" });
    }

    const follow = await Follow.create({
      follower: req.user._id,
      following: followingId,
      status: "pending"
    });

    // Notify the target user
    await Notification.create({
      user: followingId,
      type: "follow_request",
      message: `${req.user.name} sent you a follow request`,
      relatedUser: req.user._id,
      followId: follow._id
    });

    res.status(201).json(follow);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/follows/:id/accept  – accept a follow request
exports.acceptFollowRequest = async (req, res) => {
  try {
    const follow = await Follow.findById(req.params.id).populate("follower", "name");

    if (!follow) {
      return res.status(404).json({ message: "Follow request not found" });
    }

    if (follow.following.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    follow.status = "accepted";
    await follow.save();

    // Notify the requester that their request was accepted
    await Notification.create({
      user: follow.follower._id,
      type: "follow_accepted",
      message: `${req.user.name} accepted your follow request`,
      relatedUser: req.user._id,
      followId: follow._id
    });

    // Mark the follow_request notification as read for this follow
    await Notification.updateMany(
      { followId: follow._id, type: "follow_request" },
      { read: true }
    );

    res.json(follow);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/follows/:id/reject  – reject a follow request
exports.rejectFollowRequest = async (req, res) => {
  try {
    const follow = await Follow.findById(req.params.id);

    if (!follow) {
      return res.status(404).json({ message: "Follow request not found" });
    }

    if (follow.following.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    follow.status = "rejected";
    await follow.save();

    // Mark the follow_request notification as read for this follow
    await Notification.updateMany(
      { followId: follow._id, type: "follow_request" },
      { read: true }
    );

    res.json({ message: "Follow request rejected" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/follows/following  – users I follow (accepted)
exports.getFollowing = async (req, res) => {
  try {
    const follows = await Follow.find({
      follower: req.user._id,
      status: "accepted"
    }).populate("following", "name email");
    res.json(follows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/follows/followers  – users who follow me (accepted)
exports.getFollowers = async (req, res) => {
  try {
    const follows = await Follow.find({
      following: req.user._id,
      status: "accepted"
    }).populate("follower", "name email");
    res.json(follows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/follows/mutual  – users I mutually follow (can chat with)
exports.getMutualFollows = async (req, res) => {
  try {
    // Users that I follow
    const iFollow = await Follow.find({
      follower: req.user._id,
      status: "accepted"
    }).select("following");

    const iFollowIds = iFollow.map((f) => f.following.toString());

    // Users who follow me
    const followMe = await Follow.find({
      following: req.user._id,
      status: "accepted"
    }).select("follower");

    const followMeIds = followMe.map((f) => f.follower.toString());

    // Intersection (mutual)
    const mutualIds = iFollowIds.filter((id) => followMeIds.includes(id));

    const users = await User.find({ _id: { $in: mutualIds } }).select("name email");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/follows/users  – all users (for search/follow)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({
      _id: { $ne: req.user._id }
    }).select("name email");

    // Attach follow status for each user
    const follows = await Follow.find({ follower: req.user._id });
    const statusMap = {};
    follows.forEach((f) => {
      statusMap[f.following.toString()] = f.status;
    });

    const result = users.map((u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      followStatus: statusMap[u._id.toString()] || null
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
