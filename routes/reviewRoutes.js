const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Establishment = require('../models/Establishment');

// Helper function to validate review data
const validateReviewData = (data) => {
  const { reviewText, rating } = data;
  return reviewText && rating;
};

// Create a new review for an establishment
router.post('/:establishmentId/reviews', async (req, res) => {
  try {
    const { reviewText, rating, supportingPictures } = req.body;
    const establishmentId = req.params.establishmentId;
    const username = req.session.user.username; // Assuming the logged-in user's username is available in the session

    // Ensure all required fields are provided
    if (!validateReviewData(req.body)) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate supportingPictures (maximum of 5 pictures)
    if (supportingPictures && supportingPictures.length > 5) {
      return res.status(400).json({ message: 'Supporting pictures cannot exceed 5' });
    }

    // Create the new review object
    const newReview = new Review({
      reviewText,
      rating,
      username,
      establishmentId,
      supportingPictures
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
router.get('/:establishmentId/reviews', async (req, res) => {
  try {
    const establishmentId = req.params.establishmentId;

    // Find reviews for the establishment
    const reviews = await Review.find({ establishmentId })
      .sort({ reviewDate: -1 }); // Sort by latest review first

    if (reviews.length === 0) {
      return res.status(404).json({ message: 'No reviews found for this establishment' });
    }

    // Respond with all reviews for the establishment
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update a review by review ID
router.put('/reviews/:reviewId', async (req, res) => {
  try {
    const reviewId = req.params.reviewId;
    const { reviewText, rating, supportingPictures } = req.body;
    const username = req.session.user.username;

    // Find the review by ID
    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Ensure the logged-in user is the one who created the review
    if (review.username !== username) {
      return res.status(403).json({ message: 'You are not authorized to update this review' });
    }

    // Update the review fields
    review.reviewText = reviewText || review.reviewText;
    review.rating = rating || review.rating;

    // Only update supporting pictures if they are provided, and validate the number of pictures
    if (supportingPictures && supportingPictures.length <= 5) {
      review.supportingPictures = supportingPictures || review.supportingPictures;
    } else if (supportingPictures) {
      return res.status(400).json({ message: 'Supporting pictures cannot exceed 5' });
    }

    // Save the updated review
    await review.save();

    // Respond with updated review
    res.json({ message: 'Review updated successfully', review });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete a review by review ID
router.delete('/reviews/:reviewId', async (req, res) => {
  try {
    const reviewId = req.params.reviewId;
    const username = req.session.user.username;

    // Find the review by ID
    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Ensure the logged in user is the one who created the review
    if (review.username !== username) {
      return res.status(403).json({ message: 'You are not authorized to delete this review' });
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
