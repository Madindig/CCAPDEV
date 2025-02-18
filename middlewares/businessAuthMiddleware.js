// Middleware to check if the user has a "business" role
const businessAuthMiddleware = (req, res, next) => {
    if (!req.session.user || req.session.user.role !== "business") {
      return res.status(403).json({ message: "Forbidden: Only business accounts can access this" });
    }
    next();
};

module.exports = businessAuthMiddleware;