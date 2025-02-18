const express = require("express");
const router = express.Router();
const Establishment = require("../models/Establishment");

// Helper function to validate establishment data
const validateEstablishmentData = (data) => {
  const { name, amenities, location, address, shortDescription, contactNumber, mainPicture } = data;
  return name && amenities && location && address && shortDescription && contactNumber && mainPicture;
};

// Get All Establishments
router.get("/", async (req, res) => {
  try {
    const establishments = await Establishment.find();
    res.json(establishments);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get Establishment by ID
router.get("/:id", async (req, res) => {
  try {
    const establishment = await Establishment.findById(req.params.id);
    if (!establishment) return res.status(404).json({ message: "Establishment not found" });
    res.json(establishment);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Create a new Establishment
router.post("/", async (req, res) => {
  try {
    const { name, amenities, location, address, shortDescription, contactNumber, mainPicture } = req.body;

    // Ensure all required fields are provided
    if (!validateEstablishmentData(req.body)) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Create the new establishment object
    const newEstablishment = new Establishment({
      name,
      amenities,
      location,
      address,
      shortDescription,
      contactNumber,
      mainPicture,
      owner: req.session.user._id, // Save the logged-in user's ID as the owner
    });

    // Save the new establishment
    await newEstablishment.save();

    res.status(201).json({ message: "Establishment created successfully!", establishment: newEstablishment });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Delete
router.delete("/:id", async (req, res) => {
  try {
    // Find the establishment by ID
    const establishment = await Establishment.findById(req.params.id);

    // Check if the establishment exists
    if (!establishment) {
      return res.status(404).json({ message: "Establishment not found" });
    }

    // Proceed with the deletion
    await Establishment.findByIdAndDelete(req.params.id);

    // Respond with success
    res.json({ message: "Establishment deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


// Update
router.put("/:id", async (req, res) => {
  try {
    // Find the establishment by ID
    const establishment = await Establishment.findById(req.params.id);

    // Check if the establishment exists
    if (!establishment) {
      return res.status(404).json({ message: "Establishment not found" });
    }
    // Proceed with the update
    const updatedEstablishment = await Establishment.findByIdAndUpdate(req.params.id, req.body, { new: true });

    // Respond with the updated establishment
    res.json({ message: "Establishment updated successfully", establishment: updatedEstablishment });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
