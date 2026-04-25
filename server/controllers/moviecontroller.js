const Movie = require('../models/Movie');

// @route   GET /api/movies
// @desc    Get all movies for the logged-in user
exports.getMovies = async (req, res) => {
    try {
        // Find movies where the user field matches the logged-in user's ID
        const movies = await Movie.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(movies);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching movies' });
    }
};

// @route   POST /api/movies
// @desc    Add a new movie to the library
exports.addMovie = async (req, res) => {
    try {
        const { title, description, videoUrl, thumbnailUrl, genre, releaseYear } = req.body;

        const newMovie = new Movie({
            user: req.user.id, // Securely attach the user ID from the JWT
            title,
            description,
            videoUrl,
            thumbnailUrl,
            genre,
            releaseYear
        });

        const savedMovie = await newMovie.save();
        res.status(201).json(savedMovie);
    } catch (error) {
        res.status(500).json({ message: 'Error adding movie' });
    }
};

// @route   DELETE /api/movies/:id
// @desc    Delete a movie (verifying ownership)
exports.deleteMovie = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);

        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' });
        }

        // Ensure the logged-in user actually owns this movie before deleting
        if (movie.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized to delete this movie' });
        }

        await movie.deleteOne();
        res.status(200).json({ message: 'Movie deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting movie' });
    }
};