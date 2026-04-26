const Movie = require('../models/Movie');
const SavedMovie = require('../models/SavedMovie');
const FavoriteMovie = require('../models/FavoriteMovie');
const axios = require('axios');

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

exports.getAllMovies = async (req, res) => {
    try {
        const movies = await Movie.find();
        res.status(200).json(movies);
    } catch (error) { res.status(500).json({ message: 'Error fetching' }); }
};

exports.searchMovies = async (req, res) => {
    try {
        const { query } = req.query;
        const movies = await Movie.find({
            $or: [{ title: { $regex: query, $options: 'i' } }, { genre: { $regex: query, $options: 'i' } }]
        });
        res.status(200).json(movies);
    } catch (error) { res.status(500).json({ message: 'Error searching' }); }
};

// --- WATCHLIST LOGIC ---
exports.saveMovie = async (req, res) => {
    try {
        const { movieId, title, thumbnail, genre, year, rating } = req.body;
        const userId = req.user.id || req.user._id;
        if (!userId) return res.status(401).json({ message: 'User token invalid' });

        const idStr = String(movieId);
        let localMovie = await Movie.findOne({ $or: [{ tmdbId: idStr }, { title: title }] });

        if (!localMovie) {
            localMovie = new Movie({ title: title || "Unknown", thumbnail: thumbnail || "", genre: genre || "", year: String(year || ""), rating: String(rating || ""), tmdbId: idStr });
            await localMovie.save();
        } else if (!localMovie.tmdbId || localMovie.tmdbId === "undefined") {
            localMovie.tmdbId = idStr;
            await localMovie.save();
        }

        const existing = await SavedMovie.findOne({ user: userId, movie: localMovie._id });
        if (!existing) await SavedMovie.create({ user: userId, movie: localMovie._id });

        res.status(201).json({ message: 'Movie saved' });
    } catch (error) {
        console.error("SAVE ERROR:", error);
        res.status(500).json({ message: 'Error saving movie' });
    }
};

exports.getSavedMovies = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const saved = await SavedMovie.find({ user: userId }).populate('movie');
        const validMovies = saved.map(s => s.movie).filter(Boolean);
        res.status(200).json(validMovies);
    } catch (error) { res.status(500).json({ message: 'Error fetching collection' }); }
};

exports.removeSavedMovie = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const idParam = String(req.params.movieId);

        let query = [{ tmdbId: idParam }];
        if (idParam.length === 24) query.push({ _id: idParam });

        const localMovie = await Movie.findOne({ $or: query });
        if (localMovie) {
            await SavedMovie.findOneAndDelete({ user: userId, movie: localMovie._id });
        }
        
        res.status(200).json({ message: 'Removed successfully' });
    } catch (error) {
        console.error("REMOVE SAVED ERROR:", error);
        res.status(500).json({ message: 'Error removing' });
    }
};

// --- FAVORITES LOGIC ---
exports.favoriteMovie = async (req, res) => {
    try {
        const { movieId, title, thumbnail, genre, year, rating } = req.body;
        const userId = req.user.id || req.user._id;
        if (!userId) return res.status(401).json({ message: 'User token invalid' });

        const idStr = String(movieId);
        let localMovie = await Movie.findOne({ $or: [{ tmdbId: idStr }, { title: title }] });

        if (!localMovie) {
            localMovie = new Movie({ title: title || "Unknown", thumbnail: thumbnail || "", genre: genre || "", year: String(year || ""), rating: String(rating || ""), tmdbId: idStr });
            await localMovie.save();
        } else if (!localMovie.tmdbId || localMovie.tmdbId === "undefined") {
            localMovie.tmdbId = idStr;
            await localMovie.save();
        }

        const existing = await FavoriteMovie.findOne({ user: userId, movie: localMovie._id });
        if (!existing) await FavoriteMovie.create({ user: userId, movie: localMovie._id });

        res.status(201).json({ message: 'Movie favorited' });
    } catch (error) {
        console.error("FAVORITE ERROR:", error);
        res.status(500).json({ message: 'Error favoriting movie' });
    }
};

exports.getFavoriteMovies = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const favorites = await FavoriteMovie.find({ user: userId }).populate('movie');
        const validMovies = favorites.map(f => f.movie).filter(Boolean);
        res.status(200).json(validMovies);
    } catch (error) { res.status(500).json({ message: 'Error fetching favorites' }); }
};

exports.removeFavoriteMovie = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const idParam = String(req.params.movieId);

        let query = [{ tmdbId: idParam }];
        if (idParam.length === 24) query.push({ _id: idParam });

        const localMovie = await Movie.findOne({ $or: query });
        if (localMovie) {
            await FavoriteMovie.findOneAndDelete({ user: userId, movie: localMovie._id });
        }
        
        res.status(200).json({ message: 'Removed successfully' });
    } catch (error) {
        console.error("REMOVE FAV ERROR:", error);
        res.status(500).json({ message: 'Error removing' });
    }
};

// ==========================================
// 2. TMDB PROXY CONTROLLERS
// ==========================================
exports.getTrendingTMDB = async (req, res) => {
    try {
        const page = req.query.page || 1;
        const response = await axios.get(`${TMDB_BASE_URL}/trending/movie/week`, { params: { api_key: process.env.TMDB_API_KEY, page: page } });
        res.status(200).json(response.data.results);
    } catch (error) { res.status(500).json({ message: 'Failed to fetch' }); }
};

exports.getMoviesByGenreTMDB = async (req, res) => {
    try {
        const { genreId } = req.params;
        const page = req.query.page || 1;
        const response = await axios.get(`${TMDB_BASE_URL}/discover/movie`, { params: { api_key: process.env.TMDB_API_KEY, with_genres: genreId, sort_by: 'popularity.desc', page: page } });
        res.status(200).json(response.data.results);
    } catch (error) { res.status(500).json({ message: 'Failed to fetch' }); }
};

exports.getTopRatedTMDB = async (req, res) => {
    try {
        const page = req.query.page || 1;
        const response = await axios.get(`${TMDB_BASE_URL}/movie/top_rated`, { params: { api_key: process.env.TMDB_API_KEY, page: page } });
        res.status(200).json(response.data.results);
    } catch (error) { res.status(500).json({ message: 'Failed to fetch' }); }
};

exports.getMovieTrailerTMDB = async (req, res) => {
    try {
        const { movieId } = req.params;
        const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}/videos`, { params: { api_key: process.env.TMDB_API_KEY } });
        const trailer = response.data.results.find((vid) => vid.site === 'YouTube' && vid.type === 'Trailer');
        res.status(200).json({ trailerKey: trailer ? trailer.key : null });
    } catch (error) { res.status(500).json({ message: 'Failed to fetch' }); }
};

exports.getMovieProvidersTMDB = async (req, res) => {
    try {
        const { movieId } = req.params;
        const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}/watch/providers`, { params: { api_key: process.env.TMDB_API_KEY } });
        const providers = response.data.results.IN || response.data.results.US;
        res.status(200).json(providers || { flatrate: [], rent: [], buy: [] });
    } catch (error) { res.status(500).json({ message: 'Failed to fetch' }); }
};

exports.searchMoviesTMDB = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.status(200).json([]);
        const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, { params: { api_key: process.env.TMDB_API_KEY, query: query, include_adult: false } });
        res.status(200).json(response.data.results);
    } catch (error) { res.status(500).json({ message: 'Failed to search' }); }
};