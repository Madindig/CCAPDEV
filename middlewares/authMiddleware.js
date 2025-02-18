const authMiddleware = (req, res, next) => {
  // Check if the user is logged in by checking if the session contains the user
  if (!req.session.user) {
    return res.status(401).json({ message: `Unauthorized: Please log in first to access` });
  }

  // Optional: Additional checks (for example, checking if the user has expected properties)
  if (!req.session.user._id || !req.session.user.role) {
    return res.status(400).json({ message: "Bad Request: Missing user information in session" });
  }

  next(); // Proceed to the next middleware or route handler
};

module.exports = authMiddleware;
