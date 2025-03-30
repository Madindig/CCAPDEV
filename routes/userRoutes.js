const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const User = require("../models/User");
const Establishment = require("../models/Establishment");
const Review = require("../models/Review");
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

// Set up Multer storage for profile picture uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/profile_pictures/"); // Store images in this folder
  },
  filename: (req, file, cb) => {
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename); // Assign unique filename
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
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const fetchUserDetails = async (user) => {
  let establishments = [];
  let userReviews = [];
  const isBusiness = user.role === "business";

  switch (isBusiness) {
    case true:
      establishments = await Establishment.find({ owner: user._id }).lean();
      break;
    case false:
      userReviews = await Review.find({ userId: user._id }).lean();
      for (let review of userReviews) {
        let currentEstablishment = await Establishment.findOne({ _id: review.establishmentId }).lean();
        if (currentEstablishment) { 
          review.image = currentEstablishment.image;
          review.name = currentEstablishment.name;
        }
        review.stars = '★'.repeat(review.rating);
      }
      break;
  }

  return { establishments, userReviews, isBusiness };
};

router.get("/profile", async (req, res) => {
  if (!req.session.user) {
      return res.redirect("/users/login");
  }

  try {
      const user = await User.findById(req.session.user._id).lean();
      if (!user) {
          return res.status(404).send("User not found");
      }

      const { establishments, userReviews, isBusiness } = await fetchUserDetails(user);
      
      res.render("profile", { user, isBusiness, gyms: establishments, reviews: userReviews });
      
  } catch (err) {
      console.error("Error retrieving profile:", err);
      res.status(500).send("Server error");
  }
});

router.get("/users/:userId/profile", async (req, res) => {
  const userId = req.params.userId;

  try {
      const user = await User.findById(userId).lean();
      if (!user) {
          return res.status(404).send("User not found");
      }

      const { establishments, userReviews, isBusiness } = await fetchUserDetails(user);

      res.render("profile", { user, isBusiness, gyms: establishments, reviews: userReviews });

  } catch (err) {
      console.error("Error retrieving user profile:", err);
      res.status(500).send("Server error");
  }
});

router.post("/uploadTempProfilePicture", upload.single("profilePicture"), (req, res) => {
  if (!req.file) {
    console.error("No file uploaded.");
    return res.status(400).json({ message: "No file uploaded." });
  }

  console.log("Image uploaded successfully:", req.file.filename);

  res.json({ message: "Profile picture uploaded.", filename: req.file.filename });
});

// Register a new user
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, username, password, shortDescription = "", role, tempFilename } = req.body;

    if (!["people", "business"].includes(role)) {
      return res.status(400).json({ message: "Invalid role selected." });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const profilePictureFilename = tempFilename || "default_avatar.jpg"; 

    // console.log("Password received on registration:", password);
    // const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
    // console.log("Hashed password being saved:", hashedPassword);

    // Create the user AFTER assigning the correct profile picture filename
    const newUser = new User({
      firstName,
      lastName,
      username,
      password,
      role,
      shortDescription,
      profilePicture: profilePictureFilename // Assign the correct profile picture
    });

    await newUser.save();

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
    const { username, password } = req.body;

    // Find user without requiring a role
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(password, user.password); // Compare hashed password
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    req.session.user = {
      _id: user._id.toString(),
      username: user.username,
      role: user.role, // Now the role is retrieved from the database
    };

    res.json({ message: "Login successful!", user: req.session.user });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Logout a user
router.get("/logout", (req, res) => {
  if (!req.session.user) {
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

// GET /session - Check if a user session exists and return authentication status
router.get("/session", (req, res) => {
  if (req.session.user) {
    res.json({ isAuthenticated: true, user: req.session.user });
  } else {
    res.json({ isAuthenticated: false });
  }
});

// Update a user
router.put("/:userId", upload.single("profilePicture"), async (req, res) => {
  const userId = req.params.userId;

  if (req.session.user._id !== userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });
    
    const updates = {};
    const { shortDescription, password, resetProfilePicture } = req.body;

    if (shortDescription) updates.shortDescription = shortDescription;
    if (password) updates.password = await bcrypt.hash(password, 10);

    if (req.file) {
      if (user.profilePicture !== 'default_avatar.jpg') {
        const oldPath = path.join(__dirname, "../public/profile_pictures", user.profilePicture);
        fs.unlink(oldPath, (err) => {
          if (err) console.error("Error deleting old profile picture:", err);
        });
      }
      updates.profilePicture = req.file.filename;
    }

    if (resetProfilePicture === 'true') {
      if (user.profilePicture && user.profilePicture !== 'default_avatar.jpg') {
        const oldPath = path.join(__dirname, "../public/profile_pictures", user.profilePicture);
        fs.unlink(oldPath, (err) => {
          if (err) console.error("Error deleting old profile picture:", err);
        });
      }
    
      updates.profilePicture = 'default_avatar.jpg';
    }

    await User.findByIdAndUpdate(userId, updates);
    res.json({ message: "User updated successfully." });
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Delete a user
router.delete("/:userId", async (req, res) => {
  const userId = req.params.userId;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: "Password is required." });
  }

  if (req.session.user._id !== userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password." });
    }

    // Remove custom profile picture
    if (user.profilePicture !== "default_avatar.jpg") {
        const filePath = path.join(__dirname, "../public/profile_pictures", user.profilePicture);
        fs.unlink(filePath, (err) => {
            if (err) console.error("Failed to delete image:", err);
        });
    }

    await User.findByIdAndDelete(userId);

    // Destroy session after deletion
    req.session.destroy((err) => {
      if (err) console.error("Session destroy error:", err);
    });

    res.json({ message: "User deleted successfully." });

  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
