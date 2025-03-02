/*
  Import necessary packages:
  1. express.js
  2. mongoose
  3. dotenv (loads environment variables)
  4. express-session (manages user sessions)
*/
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const session = require("express-session");

/*
  Import routes:
  1. User routes (login, registration, etc.)
  2. Establishment routes
  3. Review routes
*/
const userRoutes = require("./routes/userRoutes");
const establishmentRoutes = require("./routes/establishmentRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

// Load environment variables
dotenv.config();

// Initialize Express application
const app = express();

// Parse incoming JSON requests
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET, // Secret key for signing session cookies
    resave: false, // Do not save session if it hasn't changed
    saveUninitialized: true, // Save new sessions
    cookie: { secure: false } // Use 'true' in production with HTTPS
  })
);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Define API routes
app.use("/api/users", userRoutes); // User-related routes
app.use("/api/establishments", establishmentRoutes); // Establishment routes
app.use("/api", reviewRoutes); // Review routes (not nested under establishments)

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://127.0.0.1:${PORT}`));
