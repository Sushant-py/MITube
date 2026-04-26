import axios from 'axios';

// Point this to your backend proxy (ensure your Node server is running on port 5000)
const PROXY_URL = '/api/movies/tmdb';

export const fetchMovies = {
  
  // -- Infinite Scroll Supported Endpoints --
  getTrending: async (page = 1) => {
    const response = await axios.get(`${PROXY_URL}/trending`, { params: { page } });
    return response.data;
  },
  
  getAction: async (page = 1) => {
    const response = await axios.get(`${PROXY_URL}/genre/28`, { params: { page } });
    return response.data;
  },

  getSciFi: async (page = 1) => {
    const response = await axios.get(`${PROXY_URL}/genre/878`, { params: { page } });
    return response.data;
  },

  getTopRated: async (page = 1) => {
    try {
      const response = await axios.get(`${PROXY_URL}/toprated`, { params: { page } });
      return response.data;
    } catch (e) {
      console.warn("Top-rated route failed, checking fallback.");
      return [];
    }
  },

  // -- Standard Endpoints --
  getTrailer: async (movieId) => {
    const response = await axios.get(`${PROXY_URL}/trailer/${movieId}`);
    return response.data.trailerKey;
  },

  getProviders: async (movieId) => {
    const response = await axios.get(`${PROXY_URL}/providers/${movieId}`);
    return response.data;
  },

  searchMovies: async (query) => {
    const response = await axios.get(`${PROXY_URL}/search`, { params: { query } });
    return response.data;
  }
};

// Helper function to dynamically construct high-res TMDB image URLs
export const getImageUrl = (imagePath, size = 'w1280') => {
  if (!imagePath) return 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&h=800&fit=crop'; // Cinematic fallback
  return `https://image.tmdb.org/t/p/${size}${imagePath}`;
};