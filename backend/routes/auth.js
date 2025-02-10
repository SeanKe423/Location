const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");
const Counselor = require("../models/Counselor");
const router = express.Router();

// Protected Route - Get User Profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user =
      req.user.role === "counselor"
        ? await Counselor.findById(req.user.id).select("-password")
        : await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
