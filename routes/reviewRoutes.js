const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const User = require("../models/User");
const Establishment = require("../models/Establishment");
const nodemailer = require('nodemailer');

const sourceEmail = 'spotter.website@gmail.com';
const sourceEmailPassword = 'secure1234!';

async function updateEstablishmentRating(establishmentId) {
  const reviews = await Review.find({ establishmentId });
  if (reviews.length === 0) {
    await Establishment.findByIdAndUpdate(establishmentId, { rating: 0 });
    return;
  }

  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  const average = total / reviews.length;

  await Establishment.findByIdAndUpdate(establishmentId, {
    rating: average.toFixed(1)
  });
}

async function sendReviewNotificationToUserSubscribers(userId, review, establishment) {
  // Fetch the user (owner of the establishment) and their subscribers
  const user = await User.findById(userId).populate('subscribers'); // Fetch user and their subscribers

  if (!user || !user.subscribers.length) {
    return; // No subscribers to notify
  }

  // Set up Nodemailer transport
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: sourceEmail,
      pass: sourceEmailPassword,
    },
  });

  // Send email to each subscriber
  for (let subscriber of user.subscribers) {
    const mailOptions = {
      from: sourceEmail,
      to: subscriber.email,
      subject: `New Review for ${establishment.name}`,
      html: `<p>Dear ${subscriber.username},</p>
             <p>A new review has been posted for the gym ${establishment.name} by ${review.userId.username}.</p>
             <p><strong>Review:</strong> ${review.reviewText}</p>
             <p><strong>Rating:</strong> ${review.rating} stars</p>
             <p>Thank you for following ${user.username}'s establishments!</p>`
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Email sent to ${subscriber.email}`);
    } catch (error) {
      console.error(`Error sending email to ${subscriber.email}: ${error.message}`);
    }
  }
}

function ensureLoggedIn(req, res, next) {
  if (req.session && req.session.user) return next();
  return res.status(401).json({ message: "You must be logged in to post a review." });
}

router.post("/:establishmentId/create", ensureLoggedIn, async (req, res) => {
  try {
    const { reviewText, rating } = req.body;
    const { establishmentId } = req.params;

    const establishment = await Establishment.findById(establishmentId);
    if (!establishment) return res.status(404).json({ message: "Establishment not found" });

    const userId = establishment.userId;

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

    await updateEstablishmentRating(establishmentId);

    await sendReviewNotificationToUserSubscribers(userId, newReview, establishment);

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
    await updateEstablishmentRating(review.establishmentId);

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
    await updateEstablishmentRating(review.establishmentId);
    res.status(200).json({ message: "Review deleted successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/:reviewId/vote", ensureLoggedIn, async (req, res) => {
  const { reviewId } = req.params;
  const { type } = req.body;
  const userId = req.session.user._id;

  const review = await Review.findById(reviewId);
  if (!review) return res.status(404).json({ message: "Review not found." });

  // First, remove from both
  review.likes.pull(userId);
  review.dislikes.pull(userId);

  // If the user wants to remove their reaction entirely, just save
  if (type === "remove") {
    await review.save();
    return res.status(200).json({
      updatedCounts: {
        likesCount: review.likes.length,
        dislikesCount: review.dislikes.length
      }
    });
  }

  // Otherwise, add the new vote
  if (type === "like") review.likes.push(userId);
  else if (type === "dislike") review.dislikes.push(userId);

  await review.save();

  res.status(200).json({
    updatedCounts: {
      likesCount: review.likes.length,
      dislikesCount: review.dislikes.length
    }
  });
});

module.exports = router;