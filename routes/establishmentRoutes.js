const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Establishment = require("../models/Establishment");
const Review = require("../models/Review");
const Comment = require("../models/Comment"); // need to load the comments
const { v4: uuidv4 } = require("uuid"); // Import uuid for unique filenames

// Multer Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "public/establishmentPictures/";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`; // Use uuid for unique filename
    cb(null, uniqueFilename);
  }
});

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
  limits: { fileSize: 5 * 1024 * 1024 } // Limit file size to 5MB
});

// GET Establishment by ID
router.get("/:id", async (req, res) => {
  try {
    // Fetch establishment details by ID
    const establishment = await Establishment.findById(req.params.id).lean();
    if (!establishment) return res.status(404).json({ message: "Establishment not found" });

    // Get reviews for this establishment
    const reviews = await Review.find({ establishmentId: req.params.id }).populate("userId", "username").lean();
    
    // Modify reviews to include likes and dislikes count
    const modifiedReviews = reviews.map(review => ({
      ...review,
      likesCount: review.likes.length, // Count likes
      dislikesCount: review.dislikes.length, // Count dislikes
      stars: '★'.repeat(review.rating) // Stars for rating
    }));

    // Render the establishment page with data
    res.render("establishment", { establishment, reviews: modifiedReviews });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET Comments for a Review
router.get("/:establishmentId/reviews/:reviewId", async (req, res) => {
  try {
    // Fetch review by ID and populate comments
    const review = await Review.findById(req.params.reviewId)
      .populate({
        path: "comments",
        populate: { path: "userId", select: "username" }
      })
      .lean();

    if (!review) return res.status(404).json({ message: "Review not found" });

    // Respond with comments for the review
    res.json({ comments: review.comments });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Create a new establishment with image upload
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, amenities, location, address, shortDescription, contactNumber } = req.body;

    const newEstablishment = new Establishment({
      name,
      amenities,
      location,
      address,
      shortDescription,
      contactNumber,
      owner: req.session.user._id, // Set owner to the logged-in user
      image: req.file ? req.file.filename : "default_establishment.jpg" // Use uploaded image or default
    });

    await newEstablishment.save();
    res.status(201).json({ message: "Establishment created successfully!", establishment: newEstablishment });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Update an establishment
router.put("/:id", async (req, res) => {
  try {
    const establishment = await Establishment.findById(req.params.id);

    // Check if establishment exists
    if (!establishment) {
      return res.status(404).json({ message: "Establishment not found" });
    }

    // Check if the logged-in user is the owner
    if (establishment.owner.toString() !== req.session.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to modify this establishment" });
    }

    const updatedEstablishment = await Establishment.findByIdAndUpdate(req.params.id, req.body, { new: true });

    res.json({ message: "Establishment updated successfully", establishment: updatedEstablishment });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Delete an establishment
router.delete("/:id", async (req, res) => {
  try {
    const establishment = await Establishment.findById(req.params.id);

    // Check if establishment exists
    if (!establishment) {
      return res.status(404).json({ message: "Establishment not found" });
    }

    // Check if the logged-in user is the owner
    if (establishment.owner.toString() !== req.session.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to delete this establishment" });
    }

    await Establishment.findByIdAndDelete(req.params.id);

    res.json({ message: "Establishment deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
