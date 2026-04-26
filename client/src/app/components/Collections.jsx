import React, { useState, useEffect } from 'react';
import { VideoCard } from './VideoCard';
import { Bookmark, PlayCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Collections({ onWatch, onLoginClick, savedIds, favoriteIds, onSyncList }) {
    const { user } = useAuth();
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const fetchWatchlist = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                if (!token || !user) return;
                const response = await fetch(`${API_BASE}/api/movies/collection`, { headers: { 'Authorization': `Bearer ${token}` } });
                const data = await response.json();
                if (response.ok) setMovies(data);
            } catch (error) { console.error(error); } finally { setLoading(false); }
        };
        fetchWatchlist();
    }, [user, API_BASE]);

    const handleRemove = async (movieId, e) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/api/movies/save/${movieId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            if (response.ok) {
                setMovies(prev => prev.filter(m => String(m.tmdbId) !== String(movieId) && String(m._id) !== String(movieId)));
                if (onSyncList) onSyncList('save', 'remove', movieId);
            }
        } catch (error) { console.error(error); }
    };

    if (!user) {
        return (
            <div className="px-8 py-24 max-w-4xl mx-auto">
                <div className="bg-zinc-900/50 border-2 border-dashed border-emerald-500/20 rounded-2xl p-12 text-center flex flex-col items-center">
                    <div className="h-20 w-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6"><PlayCircle className="h-10 w-10 text-emerald-500" /></div>
                    <h2 className="text-3xl text-white font-bold mb-4 tracking-tight">Your Private Watchlist</h2>
                    <p className="text-zinc-400 max-w-md mx-auto mb-8 text-lg">Create custom playlists, save favourites, and track what you want to watch next.</p>
                    <button onClick={onLoginClick} className="bg-emerald-500 text-black px-10 py-4 rounded-lg font-bold uppercase tracking-widest hover:bg-emerald-400">Sign in to save</button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-8 pt-8 pb-24">
            <div className="flex items-center gap-3 mb-8 border-b border-zinc-800 pb-4">
                <Bookmark className="w-8 h-8 text-emerald-500 fill-emerald-500/20" />
                <h1 className="text-3xl font-bold text-white uppercase tracking-widest">My Watchlist</h1>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div></div>
            ) : movies.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 bg-zinc-900/50 rounded-lg border border-zinc-800">
                    <p className="text-zinc-400 text-lg uppercase tracking-widest">No movies found in your Watchlist.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {movies.map((movie) => (
                        <VideoCard 
                            key={movie._id} id={movie.tmdbId || movie._id} title={movie.title} thumbnail={movie.thumbnail} genre={movie.genre} year={movie.year} rating={movie.rating} viewMode="grid" onWatch={onWatch}
                            isSavedInitial={true}
                            isFavoritedInitial={favoriteIds.has(String(movie.tmdbId))}
                            showRemove={true}
                            onRemoveClick={(e) => handleRemove(movie.tmdbId || movie._id, e)}
                            onSyncList={onSyncList}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}