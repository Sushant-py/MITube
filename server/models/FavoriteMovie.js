const mongoose = require('mongoose');

const favoriteMovieSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    movie: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Movie', 
        required: true 
    }
}, { timestamps: true });

favoriteMovieSchema.index({ user: 1, movie: 1 }, { unique: true });

// Safely export
module.exports = mongoose.models.FavoriteMovie || mongoose.model('FavoriteMovie', favoriteMovieSchema);