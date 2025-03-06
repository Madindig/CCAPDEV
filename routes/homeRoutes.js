const express = require("express");
const router = express.Router();
const Establishment = require("../models/Establishment");

// Get all establishments
router.get("/", async (req, res) => {
    try {
        const establishments = await Establishment.find().lean();
        res.render("home", { establishments, user: req.session.user || null });
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
