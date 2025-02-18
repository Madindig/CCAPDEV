const express = require("express");
const router = express.Router();
const Review = require("../models/Review");

// Create a new Review
router.post("/", async (req, res) => {
  try {
    const { review, rating, username, establishmentId } = req.body;

    const newReview = new Review({
      review,
      rating,
      username,
      establishment: establishmentId
    });

    await newReview.save();
    res.status(201).json({ message: "Review created successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get All Reviews
router.get("/", async (req, res) => {
  try {
    const reviews = await Review.find().populate('establishment');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get Reviews by Establishment ID
router.get("/establishment/:id", async (req, res) => {
  try {
    const reviews = await Review.find({ establishment: req.params.id }).populate('establishment');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Update a Review
router.put("/:id", async (req, res) => {
  try {
    const updatedReview = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedReview) return res.status(404).json({ message: "Review not found" });
    res.json(updatedReview);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Delete a Review
router.delete("/:id", async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    res.json({ message: "Review deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
