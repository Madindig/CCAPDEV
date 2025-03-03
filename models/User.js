const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  shortDescription: { type: String },
  role: { 
    type: String, 
    required: true, 
    enum: ["people", "business"],
    default: "people" 
  },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;