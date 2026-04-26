require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import Routes
const authRoutes = require('./routes/authroutes');
const movieRoutes = require('./routes/movieroutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// --- THE DIAGNOSTIC CHECK ---
console.log("\n=========================================");
console.log("🔍 DIAGNOSTIC CHECK:");
console.log("MONGO_URI:", process.env.MONGO_URI);
console.log("=========================================\n");

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log(' Connected to MongoDB Database'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 MITube server running on port ${PORT}`);
});