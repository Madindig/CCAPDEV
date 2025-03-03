const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Establishment = require("../models/Establishment");

// Configure Multer for Establishment Images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "public/establishmentPictures/";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueFilename = `${req.body.name.replace(/\s+/g, "_")}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpg/;
    const isValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (isValid) {
      cb(null, true);
    } else {
      cb(new Error("Only .jpg files are allowed!"), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // Limit file size to 5MB
});

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

// Create a new establishment with image upload
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, amenities, location, address, shortDescription, contactNumber } = req.body;

    const newEstablishment = new Establishment({
      name,
      amenities,
      location,
      address,
      shortDescription,
      contactNumber,
      owner: req.session.user._id,
      image: req.file ? req.file.filename : "default_establishment.jpg"
    });

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
