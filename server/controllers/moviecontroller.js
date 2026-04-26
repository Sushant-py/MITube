const Movie = require('../models/Movie');
const SavedMovie = require('../models/SavedMovie');
const axios = require('axios');

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// ==========================================
// 1. LOCAL DATABASE CONTROLLERS (MongoDB)
// ==========================================

exports.getAllMovies = async (req, res) => {
    try {
        const movies = await Movie.find();
        res.status(200).json(movies);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching catalog' });
    }
};

exports.searchMovies = async (req, res) => {
    try {
        const { query } = req.query;
        const movies = await Movie.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { genre: { $regex: query, $options: 'i' } }
            ]
        });
        res.status(200).json(movies);
    } catch (error) {
        res.status(500).json({ message: 'Error searching local movies' });
    }
};

exports.saveMovie = async (req, res) => {
    try {
        const { movieId } = req.body;
        const newSaved = new SavedMovie({
            user: req.user.id,
            movie: movieId
        });
        await newSaved.save();
        res.status(201).json({ message: 'Movie saved to collection!' });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Movie is already in your collection' });
        }
        res.status(500).json({ message: 'Error saving movie' });
    }
};

exports.getSavedMovies = async (req, res) => {
    try {
        const saved = await SavedMovie.find({ user: req.user.id }).populate('movie');
        const movies = saved.map(s => s.movie);
        res.status(200).json(movies);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching collection' });
    }
};

exports.removeSavedMovie = async (req, res) => {
    try {
        await SavedMovie.findOneAndDelete({ user: req.user.id, movie: req.params.movieId });
        res.status(200).json({ message: 'Removed from collection' });
    } catch (error) {
        res.status(500).json({ message: 'Error removing movie' });
    }
};


// ==========================================
// 2. TMDB PROXY CONTROLLERS (Internet Data)
// ==========================================

exports.getTrendingTMDB = async (req, res) => {
    try {
        const page = req.query.page || 1;
        const response = await axios.get(`${TMDB_BASE_URL}/trending/movie/week`, {
            params: { api_key: process.env.TMDB_API_KEY, page: page }
        });
        res.status(200).json(response.data.results);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch trending from TMDB' });
    }
};

exports.getMoviesByGenreTMDB = async (req, res) => {
    try {
        const { genreId } = req.params;
        const page = req.query.page || 1;
        const response = await axios.get(`${TMDB_BASE_URL}/discover/movie`, {
            params: { 
                api_key: process.env.TMDB_API_KEY,
                with_genres: genreId,
                sort_by: 'popularity.desc',
                page: page
            }
        });
        res.status(200).json(response.data.results);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch genre from TMDB' });
    }
};

exports.getTopRatedTMDB = async (req, res) => {
    try {
        const page = req.query.page || 1;
        const response = await axios.get(`${TMDB_BASE_URL}/movie/top_rated`, {
            params: { api_key: process.env.TMDB_API_KEY, page: page }
        });
        res.status(200).json(response.data.results);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch top rated from TMDB' });
    }
};

exports.getMovieTrailerTMDB = async (req, res) => {
    try {
        const { movieId } = req.params;
        const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}/videos`, {
            params: { api_key: process.env.TMDB_API_KEY }
        });
        
        const trailer = response.data.results.find(
            (vid) => vid.site === 'YouTube' && vid.type === 'Trailer'
        );
        
        res.status(200).json({ trailerKey: trailer ? trailer.key : null });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch trailer from TMDB' });
    }
};

exports.getMovieProvidersTMDB = async (req, res) => {
    try {
        const { movieId } = req.params;
        const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}/watch/providers`, {
            params: { api_key: process.env.TMDB_API_KEY }
        });
        
        const providers = response.data.results.IN || response.data.results.US;
        res.status(200).json(providers || { flatrate: [], rent: [], buy: [] });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch providers from TMDB' });
    }
};

exports.searchMoviesTMDB = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.status(200).json([]);
        
        const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
            params: { 
                api_key: process.env.TMDB_API_KEY, 
                query: query,
                include_adult: false
            }
        });
        res.status(200).json(response.data.results);
    } catch (error) {
        res.status(500).json({ message: 'Failed to search TMDB' });
    }
};