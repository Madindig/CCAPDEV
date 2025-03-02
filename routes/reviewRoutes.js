const express = require('express');
const router = express.Router();
const Review = require('../models/Review');

// Helper function to validate review data
const validateReviewData = (data) => {
  const { reviewText, rating } = data;
  return reviewText && rating;
};

// Create a new review for an establishment
router.post('/establishments/:establishmentId/reviews', async (req, res) => {
  try {
    const { reviewText, rating } = req.body;
    const establishmentId = req.params.establishmentId;
    const username = req.session.user.username;
    const userId = req.session.user._id;

    // Ensure all required fields are provided
    if (!validateReviewData(req.body)) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create the new review object
    const newReview = new Review({
      reviewText,
      rating,
      username,
      userId,
      establishmentId
    });

    // Save the review to the database
    await newReview.save();

    // Respond with success message and created review
    res.status(201).json({ message: 'Review created successfully', review: newReview });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all reviews for a specific establishment
router.get('/establishments/:establishmentId/reviews', async (req, res) => {
  try {
    const establishmentId = req.params.establishmentId;

    // Find reviews for the establishment
    const reviews = await Review.find({ establishmentId }).sort({ createdAt: -1 });

    if (reviews.length === 0) {
      return res.status(404).json({ message: 'No reviews found for this establishment' });
    }

    // Respond with all reviews for the establishment
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get a specific review by ID
router.get('/reviews/:reviewId', async (req, res) => {
  try {
    const reviewId = req.params.reviewId;
    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json(review);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update a review by ID
router.put('/reviews/:reviewId', async (req, res) => {
  try {
    const reviewId = req.params.reviewId;
    const { reviewText, rating } = req.body;
    const username = req.session.user.username;

    // Find the review by ID
    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Update the review fields
    review.reviewText = reviewText || review.reviewText;
    review.rating = rating || review.rating;

    // Save the updated review
    await review.save();

    // Respond with updated review
    res.json({ message: 'Review updated successfully', review });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete a review by ID
router.delete('/reviews/:reviewId', async (req, res) => {
  try {
    const reviewId = req.params.reviewId;
    const username = req.session.user.username;

    // Find the review by ID
    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Delete the review
    await review.deleteOne();

    // Respond with success message
    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
