const mongoose = require('mongoose');

const establishmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amenities: { type: [String], required: true },
  location: { type: String, required: true },
  address: { type: String, required: true },
  shortDescription: { type: String },
  contactNumber: { type: String },
  rating: { type: Number },
  establishmentCreationDate: { type: Date, default: Date.now },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  mainPicture: { type: String, required: true },  // URL or file path for the main picture
  supportingPictures: { 
    type: [String], 
    validate: {
      validator: function(value) {
        return value.length <= 5;  // Ensure a maximum of 5 pictures
      },
      message: 'Supporting pictures cannot exceed 5.'
    } 
  }
});

const Establishment = mongoose.model('Establishment', establishmentSchema);
module.exports = Establishment;
