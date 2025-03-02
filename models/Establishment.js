const mongoose = require('mongoose');

const allowedAmenities = [
  "Showers",
  "Lockers",
  "Sauna",
  "Swimming Pool",
  "Free WiFi Access",
  "Nutrition Bar",
  "Basketball Court",
  "TV Screens on Equipment"
];

const allowedLocations = [
  "NCR West",
  "NCR East",
  "NCR North",
  "NCR South",
  "Cavite",
  "Laguna",
  "Rizal",
  "Bulacan"
];

const establishmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amenities: { 
    type: [String], 
    enum: allowedAmenities, 
    required: true 
  },
  location: { 
    type: String, 
    enum: allowedLocations, // Restrict to predefined locations
    required: true 
  },
  address: { type: String, required: true },
  shortDescription: { type: String },
  contactNumber: { 
    type: String,
    required: true,
    validate: {
      validator: function(value) {
        return /^09\d{9}$/.test(value); // Philippine mobile number format
      },
      message: 'Invalid Philippine mobile number format. It should start with "09" followed by 9 digits.'
    }
  },
  rating: { 
    type: Number, 
    min: 1, 
    max: 5 
  },
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, { timestamps: true });

const Establishment = mongoose.model('Establishment', establishmentSchema);
module.exports = Establishment;
