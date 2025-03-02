const express = require("express");
const router = express.Router();
const Establishment = require("../models/Establishment");

// Get all establishments
router.get("/", async (req, res) => {
  try {
    const establishments = await Establishment.find();
    res.json(establishments);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get a specific establishment by ID
router.get("/:id", async (req, res) => {
  try {
    const establishment = await Establishment.findById(req.params.id);
    if (!establishment) return res.status(404).json({ message: "Establishment not found" });
    res.json(establishment);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Create a new establishment
router.post("/", async (req, res) => {
  try {
    const { name, amenities, location, address, shortDescription, contactNumber } = req.body;

    // Create the new establishment object
    const newEstablishment = new Establishment({
      name,
      amenities,
      location,
      address,
      shortDescription,
      contactNumber,
      owner: req.session.user._id, // Save the logged-in user's ID as the owner
    });

    // Save the new establishment
    await newEstablishment.save();

    res.status(201).json({ message: "Establishment created successfully!", establishment: newEstablishment });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Update an establishment
router.put("/:id", async (req, res) => {
  try {
    const establishment = await Establishment.findById(req.params.id);

    if (!establishment) {
      return res.status(404).json({ message: "Establishment not found" });
    }

    const updatedEstablishment = await Establishment.findByIdAndUpdate(req.params.id, req.body, { new: true });

    res.json({ message: "Establishment updated successfully", establishment: updatedEstablishment });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Delete an establishment
router.delete("/:id", async (req, res) => {
  try {
    const establishment = await Establishment.findById(req.params.id);

    if (!establishment) {
      return res.status(404).json({ message: "Establishment not found" });
    }

    await Establishment.findByIdAndDelete(req.params.id);

    res.json({ message: "Establishment deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
