const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { isAuthenticated } = require("../middlewares/authMiddleware");

// Register a new user
router.post("/", async (req, res) => {
  try {
    const { firstName, lastName, username, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: "Username already taken" });

    // Create a new user
    const newUser = new User({ firstName, lastName, username, password, role });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// User login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Compare passwords (No hashing yet)
    if (user.password !== password) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // Save user in session
    req.session.user = {
      _id: user._id.toString(),
      username: user.username,
      role: user.role
    };
    

    res.status(200).json({ message: "Login successful!", user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// check if a user is logged in
router.get("/session", (req, res) => {
  if (req.session.user) {
    res.json({ isAuthenticated: true, user: req.session.user });
  } else {
    res.json({ isAuthenticated: false });
  }
});

// clear the session when a user logs out.
router.post("/logout", (req, res) => {
  if (!req.session.user) {
    return res.status(400).json({ message: "No active session. User is already logged out." });
  }

  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: "Logout failed" });

    res.json({ message: "Logged out successfully" });
  });
});

// Get all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get a specific user by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Update a user
router.put("/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User updated successfully", user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Delete a user
router.delete("/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
