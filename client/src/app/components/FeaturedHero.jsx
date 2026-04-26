import { Play, Bookmark, Star, Clock } from 'lucide-react';

export function FeaturedHero({ movie, onWatch }) {
  // Map TMDB formatted data or fallback to defaults
  const title = movie?.title || "Cosmic Odyssey";
  const rating = movie?.rating || "9.8";
  const year = movie?.year || "2026";
  const description = movie?.description || "An epic journey through space and time.";
  const thumbnail = movie?.thumbnail || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&h=800&fit=crop";

  const handleMainWatch = () => {
    // Call the modal function if available
    if (onWatch && movie?.id) {
      onWatch(movie.id, title);
    } else if (movie?.videoUrl) {
      window.open(movie.videoUrl, '_blank');
    } else {
      alert("Trailer not available");
    }
  };

  const handleMainSave = () => {
    console.log("Featured movie saved to watchlist");
  };

  return (
    <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 min-h-[600px]">
      <div className="relative overflow-hidden border-2 border-emerald-500/30 bg-black rounded-lg">
        <img
          src={thumbnail}
          alt="Featured"
          className="h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute top-0 right-0 px-6 py-3 bg-emerald-500 text-black uppercase tracking-widest rounded-bl-lg font-bold">
          Featured
        </div>
      </div>

      <div className="flex flex-col justify-center space-y-6 lg:pr-12">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-px w-12 bg-emerald-500"></div>
            <span className="text-emerald-400 text-sm uppercase tracking-widest font-semibold">Now Playing</span>
          </div>
          <h1 className="text-5xl lg:text-6xl text-white tracking-tight leading-tight border-l-4 border-emerald-500 pl-6 font-bold">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-6 text-zinc-400 border-l-4 border-emerald-500/20 pl-6">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-emerald-400 fill-emerald-400" />
            <span className="text-emerald-400 font-medium">{rating}</span>
          </div>
          <span className="text-emerald-500">|</span>
          <span>{year}</span>
          <span className="text-emerald-500">|</span>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>2h 15m</span>
          </div>
        </div>

        <p className="text-zinc-400 leading-relaxed border-l-4 border-emerald-500/20 pl-6 max-w-xl line-clamp-4">
          {description}
        </p>

        <div className="flex items-center gap-4 pt-4">
          <button 
            onClick={handleMainWatch}
            className="flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-black px-8 py-4 transition-all border-2 border-emerald-500 hover:border-emerald-400 rounded-lg group"
          >
            <Play className="h-6 w-6 fill-black group-hover:scale-110 transition-transform" />
            <span className="font-bold uppercase tracking-wide">Watch Trailer</span>
          </button>
          <button 
            onClick={handleMainSave}
            className="flex items-center gap-3 border-2 border-emerald-500/50 hover:border-emerald-500 bg-black/40 hover:bg-emerald-500/10 text-emerald-400 px-8 py-4 transition-all rounded-lg"
          >
            <Bookmark className="h-6 w-6" />
            <span className="font-bold uppercase tracking-wide">Save</span>
          </button>
        </div>
      </div>
    </div>
  );
}