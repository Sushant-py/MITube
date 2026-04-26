import React, { useState, useEffect } from 'react';
import { Play, Bookmark, Star } from 'lucide-react';

export function FeaturedHero({ movie, onWatch, isSavedInitial = false, isFavoritedInitial = false, onSyncList }) {
  const [isSaved, setIsSaved] = useState(isSavedInitial);
  const [isFavorited, setIsFavorited] = useState(isFavoritedInitial);
  
  // 1. ADDED API_BASE HERE
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => { setIsSaved(isSavedInitial); }, [isSavedInitial]);
  useEffect(() => { setIsFavorited(isFavoritedInitial); }, [isFavoritedInitial]);

  if (!movie) return null;

  const handleSave = async (e) => {
    e.preventDefault(); e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      if (!token) return alert("Please log in to save movies.");

      if (isSaved) {
        // 2. ADDED API_BASE TO FETCH
        const res = await fetch(`${API_BASE}/api/movies/save/${movie.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) { setIsSaved(false); if (onSyncList) onSyncList('save', 'remove', movie.id); }
      } else {
        // 3. ADDED API_BASE TO FETCH
        const res = await fetch(`${API_BASE}/api/movies/save`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ movieId: movie.id, title: movie.title, thumbnail: movie.thumbnail, genre: movie.genre, year: movie.year, rating: movie.rating })
        });
        if (res.ok) { setIsSaved(true); if (onSyncList) onSyncList('save', 'add', movie.id); }
      }
    } catch (error) { console.error(error); }
  };

  const handleFavorite = async (e) => {
    e.preventDefault(); e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      if (!token) return alert("Please log in to favorite movies.");

      if (isFavorited) {
        // 4. ADDED API_BASE TO FETCH
        const res = await fetch(`${API_BASE}/api/movies/favorite/${movie.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) { setIsFavorited(false); if (onSyncList) onSyncList('favorite', 'remove', movie.id); }
      } else {
        // 5. ADDED API_BASE TO FETCH
        const res = await fetch(`${API_BASE}/api/movies/favorite`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ movieId: movie.id, title: movie.title, thumbnail: movie.thumbnail, genre: movie.genre, year: movie.year, rating: movie.rating })
        });
        if (res.ok) { setIsFavorited(true); if (onSyncList) onSyncList('favorite', 'add', movie.id); }
      }
    } catch (error) { console.error(error); }
  };

  return (
    <div className="relative w-full h-[70vh] min-h-[600px] overflow-hidden group">
      <div className="absolute inset-0">
        <img src={movie.thumbnail} alt={movie.title} className="w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-transform duration-1000" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
      </div>

      <div className="relative h-full flex flex-col justify-center px-8 lg:px-16 max-w-4xl z-10">
        <div className="flex items-center gap-3 mb-6">
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold uppercase tracking-widest">Trending Now</span>
          <span className="flex items-center gap-1 text-emerald-400 font-medium"><Star className="w-4 h-4 fill-emerald-400" /> {movie.rating}</span>
          <span className="text-zinc-400">{movie.year}</span>
        </div>

        <h1 className="text-5xl lg:text-7xl font-black text-white mb-6 uppercase tracking-tight leading-tight">{movie.title}</h1>
        <p className="text-lg text-zinc-400 mb-10 max-w-2xl line-clamp-3 leading-relaxed">{movie.description}</p>

        <div className="flex flex-wrap items-center gap-4">
          <button onClick={() => onWatch(movie.id, movie.title)} className="flex items-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase tracking-widest rounded-full transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-105">
            <Play className="w-6 h-6 fill-black" /> Watch Trailer
          </button>
          <button onClick={handleSave} className={`flex items-center gap-2 px-6 py-4 font-bold uppercase tracking-widest rounded-full transition-all hover:scale-105 backdrop-blur-sm border ${isSaved ? 'bg-emerald-500 text-black border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-zinc-900/80 text-white border-zinc-700 hover:border-emerald-500 hover:bg-emerald-500 hover:text-black'}`}>
            <Bookmark className="w-5 h-5" fill={isSaved ? "currentColor" : "none"} /> {isSaved ? 'Saved' : 'Save'}
          </button>
          <button onClick={handleFavorite} className={`flex items-center gap-2 px-6 py-4 font-bold uppercase tracking-widest rounded-full transition-all hover:scale-105 backdrop-blur-sm border ${isFavorited ? 'bg-emerald-500 text-black border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-zinc-900/80 text-white border-zinc-700 hover:border-emerald-500 hover:bg-emerald-500 hover:text-black'}`}>
            <Star className="w-5 h-5" fill={isFavorited ? "currentColor" : "none"} /> {isFavorited ? 'Favorited' : 'Favorite'}
          </button>
        </div>
      </div>
    </div>
  );
}