import { Play, Bookmark, Star } from 'lucide-react';
import { useState } from 'react';

export function VideoCard({ title, thumbnail, duration, year, rating, genre }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative overflow-hidden bg-zinc-950 border border-emerald-500/10 hover:border-emerald-500/30 transition-all duration-500 rounded-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-72 w-full overflow-hidden bg-black">
        <img
          src={thumbnail}
          alt={title}
          className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/0 via-transparent to-black/90" />

        {isHovered && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/60 backdrop-blur-sm">
            <button className="h-16 w-16 rounded-md border-2 border-emerald-500 bg-emerald-500/10 flex items-center justify-center hover:bg-emerald-500 transition-all group/btn">
              <Play className="h-7 w-7 text-emerald-500 group-hover/btn:text-black fill-emerald-500 group-hover/btn:fill-black ml-1" />
            </button>
            <div className="flex gap-3">
              <button className="h-10 w-10 rounded-md border border-emerald-500/50 bg-black/40 flex items-center justify-center hover:bg-emerald-500/20 transition-all">
                <Bookmark className="h-5 w-5 text-emerald-400" />
              </button>
              <button className="h-10 w-10 rounded-md border border-emerald-500/50 bg-black/40 flex items-center justify-center hover:bg-emerald-500/20 transition-all">
                <Star className="h-5 w-5 text-emerald-400" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="p-5 bg-zinc-950/90 border-t border-emerald-500/10">
        <h3 className="text-white mb-2 line-clamp-1">{title}</h3>
        {genre && <div className="text-xs text-emerald-400 mb-2 uppercase tracking-wider">{genre}</div>}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-zinc-500">
            <span>{year}</span>
            <span className="text-emerald-500">•</span>
            <span>{duration}</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-400">
            <Star className="h-4 w-4 fill-emerald-400" />
            <span>{rating}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
