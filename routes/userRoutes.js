const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");

// Register a User
router.post(
  "/register",
  [
    // Validate request body
    body("firstName").notEmpty().withMessage("First name is required"),
    body("lastName").notEmpty().withMessage("Last name is required"),
    body("username").notEmpty().withMessage("Username is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

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
  }
);

// User login route
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user exists in the database
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Compare passwords (Note: No hashing implemented yet, should be added for security)
    if (user.password !== password) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // Set user session (if session-based authentication is used)
    req.session.user = user;

    res.status(200).json({ message: "Login successful!", user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
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

// Get user by id
router.get("/:id", async (req, res) => {
  try {
    // Find user by id
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Update user
router.put("/:id", async (req, res) => {
  try {
    // Find and update user
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User updated successfully", user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Delete user
router.delete("/:id", async (req, res) => {
  try {
    // Find and delete user
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Export router
module.exports = router;
