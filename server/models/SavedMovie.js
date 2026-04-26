const mongoose = require('mongoose');

const savedMovieSchema = new mongoose.Schema({
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

// Prevent a user from saving the same movie twice
savedMovieSchema.index({ user: 1, movie: 1 }, { unique: true });

module.exports = mongoose.model('SavedMovie', savedMovieSchema);