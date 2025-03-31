const express = require("express");
const router = express.Router();
const Establishment = require("../models/Establishment");

// Get all establishments
router.get("/", async (req, res) => {
    try {
        const establishments = await Establishment.find().lean();
        res.render("home", { establishments, user: req.session.user || null, searchName : "", searchDesc : "", amenities : [], locations : [], ratings : [] });
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
});

// Search results
router.get("/results", async (req, res) => {
    const searchName = req.query.nameSearch || '';
    const searchDesc= req.query.descSearch || '';
    // Hope you like ternary operators
    // Ensures that selectedAmenities and selectedLocations is always an array
    const selectedAmenities = Array.isArray(req.query.amenities) ? req.query.amenities : req.query.amenities ? [req.query.amenities] : [];
    const selectedLocations = Array.isArray(req.query.regions) ? req.query.regions : req.query.regions ? [req.query.regions] : [];
    const selectedRatings = Array.isArray(req.query.ratings) ? req.query.ratings.map(Number) : req.query.ratings ? [Number(req.query.ratings)] : [];

    try {
        const searchFilter = {
            // Used ...(condition && filter) so that filter that
            ...(searchName != '' && { name : { $regex : searchName, $options : 'i' } }), // case insensitive substrings
            ...(searchDesc != '' && { shortDescription : { $regex : searchDesc, $options : 'i' } }), // case insensitive substrings
            ...(selectedAmenities.length > 0 && { amenities: { $all: selectedAmenities } }), // Use $all for AND instead of OR
            ...(selectedLocations.length > 0 && { location: { $in: selectedLocations } }),
            ...(selectedRatings.length > 0 && { $expr: { $in: [{ $floor: ["$rating"] }, selectedRatings]} }) // Round the rating first to nearest integer then check if its in the ratings array
        };

        const establishments = await Establishment.find(searchFilter).lean();
        
        res.render("home", { establishments, user: req.session.user || null, searchName, searchDesc, amenities : selectedAmenities, locations : selectedLocations, ratings : selectedRatings });
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
