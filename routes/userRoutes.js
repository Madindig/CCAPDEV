const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const User = require("../models/User");

// Set up Multer storage for profile picture uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/profile_pictures/"); // Store images in this folder
  },
  filename: (req, file, cb) => {
    const tempFilename = `temp_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, tempFilename); // Assign temporary filename
  }
});

// Set up Multer middleware
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpg/;
    const isValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (isValid) {
      cb(null, true);
    } else {
      cb(new Error("Only .jpg files are allowed!"), false);
    }
  },
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit
});

router.post("/uploadTempProfilePicture", upload.single("profilePicture"), (req, res) => {
  if (!req.file) {
    console.error("No file uploaded.");
    return res.status(400).json({ message: "No file uploaded." });
  }

  console.log("Image uploaded successfully:", req.file.filename);

  res.json({ message: "Temporary profile picture uploaded.", tempFilename: req.file.filename });
});

// Register a new user
router.post("/", async (req, res) => {
  try {
    const { firstName, lastName, username, password, shortDescription = "", role, tempFilename } = req.body;

    if (!["people", "business"].includes(role)) {
      return res.status(400).json({ message: "Invalid role selected." });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already taken" });
    }

    let finalFilename = "default.jpg"; // Default profile picture

    if (tempFilename) {
      const tempFilePath = path.join("public/profile_pictures/", tempFilename);
      if (fs.existsSync(tempFilePath)) {
        finalFilename = `${username}_${Date.now()}${path.extname(tempFilename)}`;
        const newFilePath = path.join("public/profile_pictures/", finalFilename);
        fs.renameSync(tempFilePath, newFilePath);
        console.log(`Profile picture renamed: ${tempFilename} → ${finalFilename}`);

        // Delete the old temp file after renaming
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
          console.log(`Deleted temporary file: ${tempFilename}`);
        }
      } else {
        console.error(`Temporary profile picture not found: ${tempFilePath}`);
      }
    }

    // Create the user AFTER assigning the correct profile picture filename
    const newUser = new User({
      firstName,
      lastName,
      username,
      password,
      role,
      shortDescription,
      profilePicture: finalFilename // Assign the correct profile picture
    });

    await newUser.save();
    console.log(`Final profile picture saved to database: ${newUser.profilePicture}`);

    req.session.user = {
      _id: newUser._id.toString(),
      username: newUser.username,
      role: newUser.role,
      profilePicture: newUser.profilePicture
    };

    res.status(201).json({ message: "Registration successful!", user: req.session.user });

  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Login a user
router.post("/login", async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Ensure role is provided and valid
    if (!role || !["people", "business"].includes(role)) {
      return res.status(400).json({ message: "Invalid or missing role." });
    }

    // Check if user exists with the specified role
    const user = await User.findOne({ username, role });
    if (!user) {
      return res.status(404).json({ message: "User not found or incorrect role" });
    }

    if (user.password !== password) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    req.session.user = {
      _id: user._id.toString(),
      username: user.username,
      role: user.role
    };

    res.json({ message: "Login successful!", user: req.session.user });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Logout a user
router.get("/logout", (req, res) => {
  if (!req.session.user) {
    // res.status(400).json({ message: "No active session. User is already logged out." });
    return res.redirect("/");
  }

  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    res.clearCookie("connect.sid", { path: "/" });
    return res.redirect("/"); // Redirect to homepage after logout
  });
});

// Check session
router.get("/session", (req, res) => {
  if (req.session.user) {
    res.json({ isAuthenticated: true, user: req.session.user });
  } else {
    res.json({ isAuthenticated: false });
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
    if (!deletedUser) { 
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
