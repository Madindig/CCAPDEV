const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");

// Register a User
router.post(
  "/register",
  [
    body("firstName").notEmpty().withMessage("First name is required"),
    body("lastName").notEmpty().withMessage("Last name is required"),
    body("username").notEmpty().withMessage("Username is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
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

// Login a User
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Compare passwords (No hashing yet, but we will add this later)
    if (user.password !== password) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // Set session user
    req.session.user = user;

    res.status(200).json({ message: "Login successful!", user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get All Users
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
