const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

const { 
    getAllMovies, 
    searchMovies, 
    saveMovie, 
    getSavedMovies, 
    removeSavedMovie,
    favoriteMovie,           // <-- NEW
    getFavoriteMovies,       // <-- NEW
    removeFavoriteMovie,     // <-- NEW
    getTrendingTMDB, 
    getMoviesByGenreTMDB, 
    getMovieTrailerTMDB,
    getMovieProvidersTMDB,
    getTopRatedTMDB,
    searchMoviesTMDB 
} = require('../controllers/moviecontroller');

// ==========================================
// 1. TMDB PROXY ROUTES (Public)
// ==========================================
router.get('/tmdb/trending', getTrendingTMDB);
router.get('/tmdb/genre/:genreId', getMoviesByGenreTMDB);
router.get('/tmdb/toprated', getTopRatedTMDB);
router.get('/tmdb/trailer/:movieId', getMovieTrailerTMDB);
router.get('/tmdb/providers/:movieId', getMovieProvidersTMDB);
router.get('/tmdb/search', searchMoviesTMDB); 

// ==========================================
// 2. LOCAL DATABASE ROUTES
// ==========================================
router.get('/all', getAllMovies);
router.get('/search', searchMovies);

// Protected Routes (Require User Token)
// Watchlist
router.post('/save', authMiddleware, saveMovie);
router.get('/collection', authMiddleware, getSavedMovies);
router.delete('/save/:movieId', authMiddleware, removeSavedMovie);

// Favorites
router.post('/favorite', authMiddleware, favoriteMovie);
router.get('/favorites', authMiddleware, getFavoriteMovies);
router.delete('/favorite/:movieId', authMiddleware, removeFavoriteMovie);

module.exports = router;