import { Play, Bookmark, Star, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export function VideoCard({ id, title, thumbnail, duration, year, rating, genre, videoUrl, viewMode = 'grid', onWatch, isSavedInitial = false, isFavoritedInitial = false, showRemove = false, onRemoveClick, onSyncList }) {
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const trailerRes = await fetch(`${API_BASE}/api/movies/tmdb/trailer/${movieId}`);
  const providersRes = await fetch(`${API_BASE}/api/movies/tmdb/providers/${movieId}`);
  const [isHovered, setIsHovered] = useState(false);
  const [isSaved, setIsSaved] = useState(isSavedInitial);
  const [isFavorited, setIsFavorited] = useState(isFavoritedInitial);

  useEffect(() => { setIsSaved(isSavedInitial); }, [isSavedInitial]);
  useEffect(() => { setIsFavorited(isFavoritedInitial); }, [isFavoritedInitial]);

  const handleWatch = (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (onWatch) { onWatch(id, title); } else if (videoUrl) { window.open(videoUrl, '_blank'); }
  };

  const handleSave = async (e) => {
    e.preventDefault(); e.stopPropagation();
    try {
      const token = localStorage.getItem('token'); 
      if (!token) return alert("Please log in to save movies.");

      if (isSaved) { 
        const response = await fetch(`${API_BASE}/api/movies/save/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        if (response.ok) { setIsSaved(false); if (onSyncList) onSyncList('save', 'remove', id); }
      } else { 
        const response = await fetch(`${API_BASE}/api/movies/save`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ movieId: id, title, thumbnail, genre, year, rating }) });
        if (response.ok) { setIsSaved(true); if (onSyncList) onSyncList('save', 'add', id); }
      }
    } catch (error) { console.error(error); }
  };

  const handleFavorite = async (e) => {
    e.preventDefault(); e.stopPropagation();
    try {
      const token = localStorage.getItem('token'); 
      if (!token) return alert("Please log in to favorite movies.");

      if (isFavorited) { 
        const response = await fetch(`${API_BASE}/api/movies/favorite/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        if (response.ok) { setIsFavorited(false); if (onSyncList) onSyncList('favorite', 'remove', id); }
      } else { 
        const response = await fetch(`${API_BASE}/api/movies/favorite`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ movieId: id, title, thumbnail, genre, year, rating }) });
        if (response.ok) { setIsFavorited(true); if (onSyncList) onSyncList('favorite', 'add', id); }
      }
    } catch (error) { console.error(error); }
  };

  if (viewMode === 'list') {
    return (
      <div onClick={handleWatch} className="group relative flex gap-6 bg-zinc-950 border border-emerald-500/10 hover:border-emerald-500/40 transition-all rounded-lg p-4 cursor-pointer items-center">
        {showRemove && (
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemoveClick(e); }} className="absolute top-2 right-2 z-50 h-8 w-8 bg-zinc-900 hover:bg-red-600 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-all border border-zinc-800 hover:border-red-500 shadow-lg">
            <X className="h-4 w-4" />
          </button>
        )}
        <div className="relative h-28 w-48 flex-shrink-0 overflow-hidden bg-black rounded-md">
          <img src={thumbnail} alt={title} className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:opacity-50" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Play className="h-10 w-10 text-emerald-500 fill-emerald-500/20" /></div>
        </div>
        <div className="flex flex-col justify-center flex-1 pr-10">
          <h3 className="text-xl text-white font-medium line-clamp-1 mb-1 group-hover:text-emerald-400 transition-colors">{title}</h3>
          {genre && <div className="text-emerald-500 text-xs font-bold uppercase tracking-widest mb-3">{genre}</div>}
          <div className="flex items-center gap-4 text-sm text-zinc-400">
            <span>{year}</span><span className="text-zinc-700">•</span><span>{duration || "2h 15m"}</span>
            <div className="flex items-center gap-1 text-emerald-400"><Star className="h-4 w-4 fill-emerald-400" /><span className="font-medium">{rating}</span></div>
          </div>
        </div>

        <div className="flex gap-4 pr-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="relative group/tooltip flex flex-col items-center">
            <button onClick={handleSave} className={`h-12 w-12 rounded-full border flex items-center justify-center transition-all ${isSaved ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-black/40 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500 hover:text-black'}`}>
              <Bookmark className="h-5 w-5" fill={isSaved ? "currentColor" : "none"} />
            </button>
            <span className="absolute top-14 scale-0 group-hover/tooltip:scale-100 transition-all bg-zinc-800 text-emerald-400 font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded shadow-lg whitespace-nowrap border border-emerald-500/30 z-50">{isSaved ? 'Remove' : 'Watchlist'}</span>
          </div>
          <div className="relative group/tooltip flex flex-col items-center">
            <button onClick={handleFavorite} className={`h-12 w-12 rounded-full border flex items-center justify-center transition-all ${isFavorited ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-black/40 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500 hover:text-black'}`}>
              <Star className="h-5 w-5" fill={isFavorited ? "currentColor" : "none"} />
            </button>
            <span className="absolute top-14 scale-0 group-hover/tooltip:scale-100 transition-all bg-zinc-800 text-emerald-400 font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded shadow-lg whitespace-nowrap border border-emerald-500/30 z-50">{isFavorited ? 'Remove' : 'Favorite'}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative overflow-hidden bg-zinc-950 border border-emerald-500/10 hover:border-emerald-500/40 transition-all duration-500 rounded-lg cursor-pointer" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} onClick={handleWatch}>
      
      {showRemove && (
        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemoveClick(e); }} className="absolute top-3 right-3 z-50 h-8 w-8 bg-black/80 hover:bg-red-600 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all backdrop-blur-sm border border-white/10 hover:border-red-500 shadow-lg" title="Remove from list">
          <X className="h-4 w-4" />
        </button>
      )}

      <div className="relative h-64 w-full overflow-hidden bg-black">
        <img src={thumbnail} alt={title} className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />

        {isHovered && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
            <div className="relative group/tooltip flex flex-col items-center">
              <button onClick={handleWatch} className="h-16 w-16 rounded-full border-2 border-emerald-500 bg-emerald-500/20 flex items-center justify-center hover:bg-emerald-500 hover:scale-110 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <Play className="h-7 w-7 text-emerald-400 group-hover/tooltip:text-black fill-emerald-400 group-hover/tooltip:fill-black ml-1" />
              </button>
              <span className="absolute top-20 scale-0 group-hover/tooltip:scale-100 transition-all bg-emerald-500 text-black font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded shadow-lg whitespace-nowrap z-50">Trailer & Links</span>
            </div>

            <div className="flex gap-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <div className="relative group/tooltip flex flex-col items-center">
                <button onClick={handleSave} className={`h-10 w-10 rounded-full border flex items-center justify-center transition-all ${isSaved ? 'bg-emerald-500 border-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-black/60 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500 hover:text-black'}`}>
                  <Bookmark className="h-4 w-4" fill={isSaved ? "currentColor" : "none"} />
                </button>
                <span className="absolute top-14 scale-0 group-hover/tooltip:scale-100 transition-all bg-zinc-800 text-emerald-400 border border-emerald-500/30 font-bold text-[10px] uppercase tracking-wider px-2 py-1 rounded shadow-lg whitespace-nowrap z-50">{isSaved ? 'Unsave' : 'Watchlist'}</span>
              </div>
              <div className="relative group/tooltip flex flex-col items-center">
                <button onClick={handleFavorite} className={`h-10 w-10 rounded-full border flex items-center justify-center transition-all ${isFavorited ? 'bg-emerald-500 border-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-black/60 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500 hover:text-black'}`}>
                  <Star className="h-4 w-4" fill={isFavorited ? "currentColor" : "none"} />
                </button>
                <span className="absolute top-14 scale-0 group-hover/tooltip:scale-100 transition-all bg-zinc-800 text-emerald-400 border border-emerald-500/30 font-bold text-[10px] uppercase tracking-wider px-2 py-1 rounded shadow-lg whitespace-nowrap z-50">{isFavorited ? 'Unfavorite' : 'Favorite'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="p-5 bg-zinc-950 border-t border-emerald-500/10">
        <h3 className="text-white font-medium mb-1 line-clamp-1 group-hover:text-emerald-400 transition-colors">{title}</h3>
        <div className="flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-2 text-zinc-500"><span>{year}</span><span className="text-zinc-700">•</span><span>{duration || "2h 15m"}</span></div>
          <div className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded"><Star className="h-3 w-3 fill-emerald-400" /><span>{rating}</span></div>
        </div>
      </div>
    </div>
  );
}