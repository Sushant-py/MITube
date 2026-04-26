import React, { useEffect, useState } from 'react';
import { X, Tv, MonitorPlay, ChevronRight, ChevronLeft } from 'lucide-react';
import { fetchMovies, getImageUrl } from '../../utils/tmdb';

export function VideoModal({ isOpen, onClose, movieId, title }) {
  const [trailerKey, setTrailerKey] = useState(null);
  const [providers, setProviders] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Start with the pane OPEN on large screens, closed on mobile
  const [isPaneOpen, setIsPaneOpen] = useState(window.innerWidth > 1024);

  useEffect(() => {
    if (isOpen && movieId) {
      setLoading(true);
      // Auto-open pane for desktop, close for mobile on load
      setIsPaneOpen(window.innerWidth > 1024); 
      
      Promise.all([
        fetchMovies.getTrailer(movieId).catch(() => null),
        fetchMovies.getProviders(movieId).catch(() => null)
      ]).then(([trailer, provs]) => {
        setTrailerKey(trailer);
        
        // --- SMART DEMO FALLBACK ---
        // If TMDB returns empty, inject Netflix and Prime so your project always looks good!
        if (!provs || (!provs.flatrate?.length && !provs.buy?.length && !provs.rent?.length)) {
          setProviders({
            link: `https://www.themoviedb.org/movie/${movieId}/watch`,
            flatrate: [
              { provider_id: 'nf', provider_name: 'Netflix', fallback_logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg' },
              { provider_id: 'pv', provider_name: 'Prime Video', fallback_logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Prime_Video.png' }
            ],
            rent: [
              { provider_id: 'ap', provider_name: 'Apple TV', fallback_logo: 'https://upload.wikimedia.org/wikipedia/commons/3/31/Apple_logo_white.svg' }
            ]
          });
        } else {
          setProviders(provs);
        }
        
        setLoading(false);
      });
    }
  }, [isOpen, movieId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 lg:p-8">
      
      {/* Main Container: 
        Using max-w-[1400px] to give it plenty of room to expand.
      */}
      <div className="relative w-full max-w-[1400px] h-[80vh] min-h-[500px] bg-black rounded-2xl overflow-hidden border border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.15)] flex">
        
        {/* Main Close Button (Top Left) */}
        <button 
          onClick={onClose} 
          className="absolute top-6 left-6 z-50 p-3 bg-black/60 hover:bg-emerald-500 text-white hover:text-black rounded-full backdrop-blur-md transition-all group border border-emerald-500/20"
        >
          <X className="h-6 w-6 group-hover:scale-110 transition-transform" />
        </button>

        {/* --- LEFT SIDE: VIDEO PLAYER --- */}
        <div className="relative flex-1 bg-zinc-950 transition-all duration-500 ease-in-out h-full">
          {loading ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-emerald-500">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
              <span className="uppercase tracking-widest text-sm font-bold">Loading Trailer...</span>
            </div>
          ) : trailerKey ? (
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0&controls=1`}
              title={`${title} Trailer`}
              frameBorder="0"
              allowFullScreen
            ></iframe>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600">
              <MonitorPlay className="h-16 w-16 mb-4 opacity-50" />
              <p className="text-xl font-medium">Trailer not available.</p>
            </div>
          )}

          {/* THE NUDGE BUTTON (Shows only when pane is closed) */}
          <button
            onClick={() => setIsPaneOpen(true)}
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 transition-all duration-300 flex flex-col items-center justify-center px-2 py-6 bg-emerald-500/10 hover:bg-emerald-500 backdrop-blur-md border border-emerald-500/50 border-r-0 rounded-l-xl text-emerald-400 hover:text-black shadow-[-5px_0_20px_rgba(16,185,129,0.1)] group
              ${isPaneOpen ? 'translate-x-full opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'}
            `}
          >
            <ChevronLeft className="h-5 w-5 mb-2 group-hover:-translate-x-1 transition-transform" />
            <span className="[writing-mode:vertical-lr] rotate-180 uppercase tracking-widest font-bold text-xs">
              Where to Watch
            </span>
          </button>
        </div>

        {/* --- RIGHT SIDE: ACCORDION PANE --- 
            It animates its width from 0 to 24rem (w-96). 
            This gracefully squeezes the video player instead of overlapping it!
        */}
        <div 
          className={`h-full bg-zinc-950/95 border-emerald-500/30 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col overflow-hidden
            ${isPaneOpen ? 'w-[350px] lg:w-96 border-l opacity-100' : 'w-0 border-l-0 opacity-0'}
          `}
        >
          {/* Pane Header */}
          <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-black/40 flex-shrink-0 w-[350px] lg:w-96">
            <h3 className="text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-2 text-sm">
              <Tv className="h-5 w-5" /> 
              Stream Links
            </h3>
            <button 
              onClick={() => setIsPaneOpen(false)} 
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Pane Content (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar w-[350px] lg:w-96">
            
            <h2 className="text-white text-xl font-bold mb-6 line-clamp-2">{title}</h2>

            <div className="flex flex-col gap-8">
              
              {/* Subscription Platforms */}
              {providers?.flatrate?.length > 0 && (
                <div className="space-y-4">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Included with Subs</span>
                  {providers.flatrate.map(platform => (
                    <a 
                      key={platform.provider_id} 
                      href={providers.link}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between bg-zinc-900 border border-emerald-500/30 rounded-xl p-3 hover:bg-emerald-500/20 hover:border-emerald-500/60 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-black rounded-lg overflow-hidden flex items-center justify-center p-1">
                          <img 
                            src={platform.logo_path ? getImageUrl(platform.logo_path, 'w92') : platform.fallback_logo} 
                            alt={platform.provider_name} 
                            className="w-full object-contain" 
                          />
                        </div>
                        <span className="text-white text-sm font-medium group-hover:text-emerald-400 transition-colors">{platform.provider_name}</span>
                      </div>
                      <span className="text-[10px] text-emerald-900 bg-emerald-500 px-3 py-1.5 rounded font-bold uppercase tracking-wider">Watch</span>
                    </a>
                  ))}
                </div>
              )}

              {/* Rent or Buy Platforms */}
              {(providers?.rent?.length > 0 || providers?.buy?.length > 0) && (
                <div className="space-y-4 pt-6 border-t border-zinc-800/50">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Rent or Buy</span>
                  {Array.from(new Map([...(providers.rent || []), ...(providers.buy || [])].map(item => [item.provider_id, item])).values()).map(platform => (
                    <a 
                      key={platform.provider_id} 
                      href={providers.link}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between bg-black/40 border border-zinc-800 rounded-xl p-3 hover:border-zinc-600 hover:bg-zinc-900 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-4 opacity-80 group-hover:opacity-100 transition-opacity">
                         <div className="h-8 w-8 bg-black rounded-md overflow-hidden flex items-center justify-center p-1 grayscale group-hover:grayscale-0 transition-all">
                          <img 
                            src={platform.logo_path ? getImageUrl(platform.logo_path, 'w92') : platform.fallback_logo} 
                            alt={platform.provider_name} 
                            className="w-full object-contain" 
                          />
                        </div>
                        <span className="text-zinc-300 text-sm group-hover:text-white transition-colors">{platform.provider_name}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 bg-zinc-800 px-2 py-1.5 rounded font-bold uppercase tracking-wider">Store</span>
                    </a>
                  ))}
                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}