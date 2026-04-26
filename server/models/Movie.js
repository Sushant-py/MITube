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

const savedMovieSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    movieId: { type: String, required: true }, // TMDB ID
    title: { type: String, required: true },
    poster: { type: String },
    rating: { type: String },
    year: { type: String },
    type: { type: String, enum: ['favorite', 'watchlist'], default: 'watchlist' }
}, { timestamps: true });

module.exports = mongoose.model('SavedMovie', savedMovieSchema);