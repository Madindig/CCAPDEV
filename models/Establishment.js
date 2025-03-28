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
  amenities: { type: [String], enum: allowedAmenities, required: true },
  location: { type: String, enum: allowedLocations, required: true },
  address: { type: String, required: true },
  shortDescription: { type: String },
  contactNumber: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5 },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  image: { type: String }
}, { timestamps: true });

const Establishment = mongoose.model('Establishment', establishmentSchema);
module.exports = Establishment;
