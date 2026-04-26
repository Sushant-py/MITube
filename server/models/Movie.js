const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String }, 
    trailerUrl: { type: String },  
    thumbnail: { type: String },   
    genre: { type: String },
    year: { type: String },        
    rating: { type: String },      
    tmdbId: { type: String },      
    category: { 
        type: String, 
        enum: ['trending', 'new', 'classic', 'standard'], 
        default: 'standard' 
    },
    watchLinks: [{
        platform: { type: String }, 
        url: { type: String }
    }]
}, { timestamps: true });

// Export ONLY the Movie model. (No SavedMovie code here!)
module.exports = mongoose.models.Movie || mongoose.model('Movie', movieSchema);