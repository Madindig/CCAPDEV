/*
  Import the necessary packages
  1. express.js
  2. mongoose
  3. dontenv (loads environment variables from .env file)
  4. express-session (manages user sessions)
*/
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const session = require("express-session");

/*
  Import routes
  1. user-related routes (login, registration, etc.)
  2. routes for establishments
  3. routes for reviews of establishment
*/
const userRoutes = require("./routes/userRoutes");
const establishmentRoutes = require("./routes/establishmentRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

// Loads variables from the .env file into process.env
dotenv.config();

// Creates a new instance of an Express application
const app = express();

// Parses incoming JSON requests and makes them accessible via req.body
app.use(express.json());

app.use(
  session({
  secret: process.env.SESSION_SECRET, // Secret used to sign session cookies for security
  resave: false, // Do not save session data if it hasn’t changed
  saveUninitialized: true, // Save a new, but unmodified session (e.g., login sessions)
  cookie: { secure: false } // Cookie settings; 'secure: false' means HTTPS is not required (use 'true' in production with HTTPS)
  })
);

mongoose
  .connect(process.env.MONGO_URI) // Connects to MongoDB using URI from environment variables
  .then(() => console.log("✅ Connected to MongoDB")) // On successful connection, logs confirmation
  .catch(err => console.error("❌ MongoDB Connection Error:", err)); // Logs error if connection fails

app.use("/api/users", userRoutes); // All user routes start with '/api/users'
app.use("/api/establishments", establishmentRoutes); // Establishment routes start with '/api/establishments'
app.use("/api/establishments", reviewRoutes); // Review routes also nested under '/api/establishments'

// Start the server
const PORT = process.env.PORT; // Uses PORT from environment
app.listen(PORT, () => console.log(`🚀 Server running on http://127.0.0.1:${PORT}`)); // Starts server and logs URL
