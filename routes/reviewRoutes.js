const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const Establishment = require("../models/Establishment");

function ensureLoggedIn(req, res, next) {
  if (req.session && req.session.user) return next();
  return res.status(401).json({ message: "You must be logged in to post a review." });
}

router.post("/:establishmentId/create", ensureLoggedIn, async (req, res) => {
  try {
    const { reviewText, rating } = req.body;
    const { establishmentId } = req.params;

    const newReview = new Review({
      userId: req.session.user._id,
      establishmentId,
      reviewText,
      rating: parseInt(rating),
      likes: [],
      dislikes: [],
      createdAt: new Date()
    });

    await newReview.save();

    res.status(201).json({ message: "Review posted successfully!", review: newReview });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
    console.error("Review save failed:", err);
  }
});

module.exports = router;