import { Play, Bookmark, Star } from 'lucide-react';
import { useState } from 'react';

export function VideoCard({ id, title, thumbnail, duration, year, rating, genre, videoUrl, viewMode = 'grid', onWatch }) {
  const [isHovered, setIsHovered] = useState(false);

  // Trigger the Modal
  const handleWatch = (e) => {
    if (e) e.stopPropagation();
    if (onWatch) {
      onWatch(id, title);
    } else if (videoUrl) {
      window.open(videoUrl, '_blank');
    } else {
      alert("Trailer link not available.");
    }
  };

  const handleSave = (e) => {
    e.stopPropagation();
    console.log(`Saved to watchlist: ${title}`);
  };

  const handleFavorite = (e) => {
    e.stopPropagation();
    console.log(`Added to favorites: ${title}`);
  };

  // --- LIST VIEW UI ---
  if (viewMode === 'list') {
    return (
      <div 
        onClick={handleWatch}
        className="group flex gap-6 bg-zinc-950 border border-emerald-500/10 hover:border-emerald-500/40 transition-all rounded-lg p-4 cursor-pointer items-center"
      >
        <div className="relative h-28 w-48 flex-shrink-0 overflow-hidden bg-black rounded-md">
          <img src={thumbnail} alt={title} className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:opacity-50" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
             <Play className="h-10 w-10 text-emerald-500 fill-emerald-500/20" />
          </div>
        </div>
        
        <div className="flex flex-col justify-center flex-1">
          <h3 className="text-xl text-white font-medium line-clamp-1 mb-1 group-hover:text-emerald-400 transition-colors">{title}</h3>
          {genre && <div className="text-emerald-500 text-xs font-bold uppercase tracking-widest mb-3">{genre}</div>}
          
          <div className="flex items-center gap-4 text-sm text-zinc-400">
            <span>{year}</span>
            <span className="text-zinc-700">•</span>
            <span>{duration || "2h 15m"}</span>
            <span className="text-zinc-700">•</span>
            <div className="flex items-center gap-1 text-emerald-400">
              <Star className="h-4 w-4 fill-emerald-400" />
              <span className="font-medium">{rating}</span>
            </div>
          </div>
        </div>

        {/* List View Actions with Tooltips */}
        <div className="flex gap-4 pr-4 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Watchlist Button */}
          <div className="relative group/tooltip flex flex-col items-center">
            <button onClick={handleSave} className="h-12 w-12 rounded-full border border-emerald-500/50 bg-black/40 flex items-center justify-center hover:bg-emerald-500 hover:text-black transition-all text-emerald-400">
              <Bookmark className="h-5 w-5" />
            </button>
            <span className="absolute -top-10 scale-0 group-hover/tooltip:scale-100 transition-all bg-emerald-500 text-black font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded shadow-lg whitespace-nowrap">
              Watchlist
            </span>
          </div>
          
          {/* Favorite Button */}
          <div className="relative group/tooltip flex flex-col items-center">
            <button onClick={handleFavorite} className="h-12 w-12 rounded-full border border-emerald-500/50 bg-black/40 flex items-center justify-center hover:bg-emerald-500 hover:text-black transition-all text-emerald-400">
              <Star className="h-5 w-5" />
            </button>
            <span className="absolute -top-10 scale-0 group-hover/tooltip:scale-100 transition-all bg-emerald-500 text-black font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded shadow-lg whitespace-nowrap">
              Favorite
            </span>
          </div>
        </div>
      </div>
    );
  }

  // --- GRID VIEW UI (Default) ---
  return (
    <div
      className="group relative overflow-hidden bg-zinc-950 border border-emerald-500/10 hover:border-emerald-500/40 transition-all duration-500 rounded-lg cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleWatch}
    >
      <div className="relative h-64 w-full overflow-hidden bg-black">
        <img
          src={thumbnail}
          alt={title}
          className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />

        {isHovered && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
            
            {/* Play Button with Tooltip */}
            <div className="relative group/tooltip flex flex-col items-center">
              <button 
                onClick={handleWatch}
                className="h-16 w-16 rounded-full border-2 border-emerald-500 bg-emerald-500/20 flex items-center justify-center hover:bg-emerald-500 hover:scale-110 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                <Play className="h-7 w-7 text-emerald-400 group-hover/tooltip:text-black fill-emerald-400 group-hover/tooltip:fill-black ml-1" />
              </button>
              <span className="absolute -top-12 scale-0 group-hover/tooltip:scale-100 transition-all bg-emerald-500 text-black font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded shadow-lg whitespace-nowrap z-10">
                Trailer & Links
              </span>
            </div>

            <div className="flex gap-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              
              {/* Watchlist Button with Tooltip */}
              <div className="relative group/tooltip flex flex-col items-center">
                <button onClick={handleSave} className="h-10 w-10 rounded-full border border-emerald-500/50 bg-black/60 flex items-center justify-center hover:bg-emerald-500 hover:text-black transition-all text-emerald-400">
                  <Bookmark className="h-4 w-4" />
                </button>
                <span className="absolute -top-10 scale-0 group-hover/tooltip:scale-100 transition-all bg-zinc-800 text-emerald-400 border border-emerald-500/30 font-bold text-[10px] uppercase tracking-wider px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
                  Watchlist
                </span>
              </div>

              {/* Favorite Button with Tooltip */}
              <div className="relative group/tooltip flex flex-col items-center">
                <button onClick={handleFavorite} className="h-10 w-10 rounded-full border border-emerald-500/50 bg-black/60 flex items-center justify-center hover:bg-emerald-500 hover:text-black transition-all text-emerald-400">
                  <Star className="h-4 w-4" />
                </button>
                <span className="absolute -top-10 scale-0 group-hover/tooltip:scale-100 transition-all bg-zinc-800 text-emerald-400 border border-emerald-500/30 font-bold text-[10px] uppercase tracking-wider px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
                  Favorite
                </span>
              </div>

            </div>
          </div>
        )}
      </div>

      <div className="p-5 bg-zinc-950 border-t border-emerald-500/10">
        <h3 className="text-white font-medium mb-1 line-clamp-1 group-hover:text-emerald-400 transition-colors">{title}</h3>
        {genre && <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mb-3">{genre}</div>}
        
        <div className="flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-2 text-zinc-500">
            <span>{year}</span>
            <span className="text-zinc-700">•</span>
            <span>{duration || "2h 15m"}</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
            <Star className="h-3 w-3 fill-emerald-400" />
            <span>{rating}</span>
          </div>
        </div>
      </div>
    </div>
  );
}