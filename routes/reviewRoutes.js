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

//edit review
router.put("/:reviewId/edit", ensureLoggedIn, async (req, res) => {
  try {
    const { reviewText, rating } = req.body;
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    // Optional: check ownership
    if (!review.userId.equals(req.session.user._id)) {
      return res.status(403).json({ message: "Unauthorized to edit this review" });
    }

    review.reviewText = reviewText;
    review.rating = parseInt(rating);
    review.edited = true;
    await review.save();

    res.status(200).json({ message: "Review updated successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// delete review
router.delete("/:reviewId", ensureLoggedIn, async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    // Optional: check ownership
    if (!review.userId.equals(req.session.user._id)) {
      return res.status(403).json({ message: "Unauthorized to delete this review" });
    }

    await Review.findByIdAndDelete(reviewId);
    res.status(200).json({ message: "Review deleted successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;