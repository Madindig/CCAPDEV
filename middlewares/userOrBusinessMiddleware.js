// Middleware to check if the user is the owner of the establishment or has a "business" role
const userOrBusinessMiddleware = async (req, res, next) => {
    try {
        const establishment = await Establishment.findById(req.params.id);
        if (!establishment) {
        return res.status(404).json({ message: "Establishment not found" });
        }

        // Either the user is the business owner, or the user has a "business" role
        if (establishment.owner.toString() !== req.session.user._id && req.session.user.role !== "business") {
        return res.status(403).json({ message: "Forbidden: Not allowed to modify this establishment" });
        }

        // Allow the request to proceed
        next();
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

module.exports = userOrBusinessMiddleware;