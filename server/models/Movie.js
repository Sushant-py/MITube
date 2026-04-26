const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    trailerUrl: { type: String, required: true }, // YouTube embed link
    thumbnailUrl: { type: String },
    genre: { type: String },
    releaseYear: { type: Number },
    category: { type: String, enum: ['trending', 'new', 'classic', 'standard'], default: 'standard' },
    watchLinks: [{
        platform: { type: String }, // e.g., "Netflix", "Amazon", "Apple TV"
        url: { type: String }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Movie', movieSchema);