const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    videoUrl: { type: String, required: true },
    thumbnailUrl: { type: String },
    genre: { type: String },
    releaseYear: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('Movie', movieSchema);