require('dotenv').config();
const mongoose = require('mongoose');
const Movie = require('./models/Movie');

const movies = [
  {
    title: 'Dune: Part Two',
    description: 'Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.',
    trailerUrl: 'https://www.youtube.com/embed/Way9Dexny3w',
    thumbnailUrl: 'https://images.unsplash.com/photo-1541873676-a18131494184?w=800&h=450&fit=crop',
    genre: 'Sci-Fi',
    releaseYear: 2024,
    category: 'trending',
    watchLinks: [{ platform: 'Max', url: 'https://www.max.com/' }, { platform: 'Apple TV', url: 'https://tv.apple.com/' }]
  },
  {
    title: 'The Dark Knight',
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    trailerUrl: 'https://www.youtube.com/embed/EXeTwQWrcwY',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=800&h=450&fit=crop',
    genre: 'Action',
    releaseYear: 2008,
    category: 'classic',
    watchLinks: [{ platform: 'Max', url: 'https://www.max.com/' }, { platform: 'Amazon Prime', url: 'https://www.amazon.com/primevideo' }]
  },
  {
    title: 'Civil War',
    description: 'A journey across a dystopian future America, following a team of military-embedded journalists as they race against time to reach DC before rebel factions descend upon the White House.',
    trailerUrl: 'https://www.youtube.com/embed/aDyQZIGjDP8',
    thumbnailUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=450&fit=crop',
    genre: 'Action',
    releaseYear: 2024,
    category: 'new',
    watchLinks: [{ platform: 'A24', url: 'https://a24films.com/' }]
  }
];

mongoose.connect(process.env.MONGO_URI).then(async () => {
    await Movie.deleteMany({});
    await Movie.insertMany(movies);
    console.log('Database seeded with professional catalog!');
    process.exit();
});