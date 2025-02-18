const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewText: { type: String, required: true },
  rating: { type: Number, required: true },
  username: { type: String, required: true },
  establishmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Establishment', required: true },
  reviewDate: { type: Date, default: Date.now },
  supportingPictures: { 
    type: [String], 
    validate: {
      validator: function(value) {
        return value.length <= 5;
      },
      message: 'Supporting pictures cannot exceed 5.'
    } 
  }
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
