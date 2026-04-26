import React, { useEffect, useState, useCallback } from 'react';
import {
  X, Tv, MonitorPlay,
  ChevronRight, ChevronLeft, ExternalLink,
  ShoppingCart, Search
} from 'lucide-react';
import { fetchMovies, getImageUrl } from '../../utils/tmdb';

// ─── Direct platform search URLs ──────────────────────────────────────────────
// Each entry maps the exact provider_name string TMDB returns to a search URL.
// Any platform not listed falls through to a Google search.
function getPlatformUrl(platformName, movieTitle) {
  const q = encodeURIComponent(movieTitle);
  const map = {
    'Netflix':              `https://www.netflix.com/search?q=${q}`,
    'Amazon Prime Video':   `https://www.primevideo.com/search?phrase=${q}`,
    'Prime Video':          `https://www.primevideo.com/search?phrase=${q}`,
    'Disney Plus':          `https://www.disneyplus.com/search?q=${q}`,
    'Disney+':              `https://www.disneyplus.com/search?q=${q}`,
    'Disney+ Hotstar':      `https://www.hotstar.com/in/search?q=${q}`,
    'Hotstar':              `https://www.hotstar.com/in/search?q=${q}`,
    'Apple TV':             `https://tv.apple.com/search?term=${q}`,
    'Apple TV+':            `https://tv.apple.com/search?term=${q}`,
    'Google Play Movies':   `https://play.google.com/store/search?q=${q}&c=movies`,
    'YouTube Premium':      `https://www.youtube.com/results?search_query=${q}`,
    'Jio Cinema':           `https://www.jiocinema.com/search/${q}`,
    'JioCinema':            `https://www.jiocinema.com/search/${q}`,
    'Zee5':                 `https://www.zee5.com/search?q=${q}`,
    'SonyLIV':              `https://www.sonyliv.com/search?keyword=${q}`,
    'Mubi':                 `https://mubi.com/search/${q}`,
  };
  return map[platformName] ?? `https://www.google.com/search?q=watch+${q}+online`;
}

// ─── Fallback shown when TMDB returns no providers for the user's region ───────
const FALLBACK_PROVIDERS = {
  flatrate: [
    {
      provider_name: 'Netflix',
      fallback_logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
    },
    {
      provider_name: 'Prime Video',
      fallback_logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Prime_Video.png',
    },
    {
      provider_name: 'Disney+ Hotstar',
      fallback_logo: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Disney%2B_Hotstar_logo.svg',
    },
  ],
  rent: [],
  buy:  [],
};

// ─── Provider link card ────────────────────────────────────────────────────────
function ProviderCard({ platform, movieTitle, variant = 'stream' }) {
  const href = getPlatformUrl(platform.provider_name, movieTitle);
  const logo = platform.logo_path
    ? getImageUrl(platform.logo_path, 'w92')
    : platform.fallback_logo;

  const isStream = variant === 'stream';

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center justify-between rounded-xl p-3 transition-all cursor-pointer group ${
        isStream
          ? 'bg-zinc-900 border border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-500/60'
          : 'bg-black/40 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900'
      }`}
    >
      <div className={`flex items-center gap-4 ${isStream ? '' : 'opacity-80 group-hover:opacity-100 transition-opacity'}`}>
        <div className={`bg-black rounded-lg overflow-hidden flex items-center justify-center p-1 flex-shrink-0 ${
          isStream ? 'h-10 w-10' : 'h-8 w-8 grayscale group-hover:grayscale-0 transition-all'
        }`}>
          {logo ? (
            <img src={logo} alt={platform.provider_name} className="w-full object-contain" />
          ) : (
            <MonitorPlay className="h-4 w-4 text-zinc-600" />
          )}
        </div>
        <span className={`text-sm font-medium transition-colors ${
          isStream
            ? 'text-white group-hover:text-emerald-400'
            : 'text-zinc-300 group-hover:text-white'
        }`}>
          {platform.provider_name}
        </span>
      </div>

      {isStream ? (
        <span className="text-[10px] text-emerald-950 bg-emerald-500 px-3 py-1.5 rounded font-bold uppercase tracking-wider flex-shrink-0">
          Watch
        </span>
      ) : (
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[10px] text-zinc-500 bg-zinc-800 px-2 py-1.5 rounded font-bold uppercase tracking-wider">
            Store
          </span>
          <ExternalLink className="h-3.5 w-3.5 text-zinc-600 group-hover:text-zinc-400" />
        </div>
      )}
    </a>
  );
}

// ─── Main modal ────────────────────────────────────────────────────────────────
export function VideoModal({ isOpen, onClose, movieId, title }) {
  const [trailerKey,   setTrailerKey]   = useState(null);
  const [providers,    setProviders]    = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [trailerError, setTrailerError] = useState(false);

  // Open by default on desktop, collapsed on mobile
  const [isPaneOpen, setIsPaneOpen] = useState(() => window.innerWidth >= 1024);

  // ── Escape key + body scroll lock ─────────────────────────────────────────
  const handleKey = useCallback(e => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKey]);

  // ── Fetch trailer + providers in parallel ──────────────────────────────────
  useEffect(() => {
    if (!isOpen || !movieId) return;

    setLoading(true);
    setTrailerKey(null);
    setProviders(null);
    setTrailerError(false);
    setIsPaneOpen(window.innerWidth >= 1024);

    Promise.all([
      fetchMovies.getTrailer(movieId).catch(() => null),
      fetchMovies.getProviders(movieId).catch(() => null),
    ]).then(([trailer, provs]) => {
      setTrailerKey(trailer);
      setTrailerError(!trailer);

      const hasData =
        provs && (provs.flatrate?.length || provs.rent?.length || provs.buy?.length);
      setProviders(hasData ? provs : FALLBACK_PROVIDERS);
    }).finally(() => setLoading(false));
  }, [isOpen, movieId]);

  if (!isOpen) return null;

  // Deduplicate rent + buy by provider_name
  const rentBuy = Array.from(
    new Map(
      [...(providers?.rent ?? []), ...(providers?.buy ?? [])].map(p => [p.provider_name, p])
    ).values()
  );

  return (
    // Backdrop — click outside to close
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 lg:p-8"
      onClick={onClose}
    >
      {/* Modal shell */}
      <div
        className="relative w-full max-w-[1400px] h-[80vh] min-h-[500px] bg-black rounded-2xl overflow-hidden border border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.15)] flex"
        onClick={e => e.stopPropagation()}
      >

        {/* ── Close button ──────────────────────────────────────────────────── */}
        <button
          onClick={onClose}
          className="absolute top-6 left-6 z-50 p-3 bg-black/60 hover:bg-emerald-500 text-white hover:text-black rounded-full backdrop-blur-md transition-all group border border-emerald-500/20"
          aria-label="Close"
        >
          <X className="h-6 w-6 group-hover:rotate-90 transition-transform" />
        </button>

        {/* ── LEFT — video player ────────────────────────────────────────────── */}
        <div className="relative flex-1 bg-zinc-950 transition-all duration-500 ease-in-out h-full min-w-0">

          {loading ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-emerald-500">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500" />
              <span className="uppercase tracking-widest text-sm font-bold">Loading Trailer...</span>
            </div>
          ) : trailerKey ? (
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0&controls=1&modestbranding=1`}
              title={`${title} Trailer`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600">
              <MonitorPlay className="h-16 w-16 mb-4 opacity-50" />
              <p className="text-xl font-medium">Trailer not available</p>
              <p className="text-sm text-zinc-700 mt-1">Check the streaming links →</p>
            </div>
          )}

          {/* Nudge tab — visible only when pane is closed */}
          <button
            onClick={() => setIsPaneOpen(true)}
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 transition-all duration-300 flex flex-col items-center justify-center px-2 py-6 bg-emerald-500/10 hover:bg-emerald-500 backdrop-blur-md border border-emerald-500/50 border-r-0 rounded-l-xl text-emerald-400 hover:text-black shadow-[-5px_0_20px_rgba(16,185,129,0.1)] group ${
              isPaneOpen
                ? 'translate-x-full opacity-0 pointer-events-none'
                : 'translate-x-0 opacity-100'
            }`}
            aria-label="Open streaming links"
          >
            <ChevronLeft className="h-5 w-5 mb-2 group-hover:-translate-x-1 transition-transform" />
            <span className="[writing-mode:vertical-lr] rotate-180 uppercase tracking-widest font-bold text-xs">
              Where to Watch
            </span>
          </button>
        </div>

        {/* ── RIGHT — streaming pane ─────────────────────────────────────────── */}
        <div
          className={`h-full bg-zinc-950/95 border-emerald-500/30 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col overflow-hidden flex-shrink-0 ${
            isPaneOpen ? 'w-[350px] lg:w-96 border-l opacity-100' : 'w-0 border-l-0 opacity-0'
          }`}
        >
          {/* Pane header */}
          <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-black/40 flex-shrink-0">
            <h3 className="text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-2 text-sm whitespace-nowrap">
              <Tv className="h-5 w-5" /> Stream Links
            </h3>
            <button
              onClick={() => setIsPaneOpen(false)}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
              aria-label="Collapse pane"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Pane body — scrollable */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">

            <h2 className="text-white text-xl font-bold mb-6 line-clamp-2">{title}</h2>

            {loading ? (
              <div className="flex items-center gap-3 text-zinc-600 text-sm">
                <div className="animate-spin rounded-full h-4 w-4 border-b border-zinc-500" />
                Fetching links...
              </div>
            ) : (
              <div className="flex flex-col gap-8">

                {/* ── Subscription / streaming ── */}
                {providers?.flatrate?.length > 0 && (
                  <div className="space-y-3">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                      Included with subscription
                    </span>
                    {providers.flatrate.map((p, i) => (
                      <ProviderCard
                        key={p.provider_name + i}
                        platform={p}
                        movieTitle={title}
                        variant="stream"
                      />
                    ))}
                  </div>
                )}

                {/* ── Rent / Buy ── */}
                {rentBuy.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-zinc-800/60">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold flex items-center gap-1">
                      <ShoppingCart className="h-3 w-3" /> Rent or Buy
                    </span>
                    {rentBuy.map((p, i) => (
                      <ProviderCard
                        key={p.provider_name + i}
                        platform={p}
                        movieTitle={title}
                        variant="store"
                      />
                    ))}
                  </div>
                )}

                {/* ── Always-available Google fallback ── */}
                <div className="pt-4 border-t border-zinc-800/60">
                  <span className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold flex items-center gap-1 mb-3">
                    <Search className="h-3 w-3" /> Can't find it?
                  </span>
                  <a
                    href={`https://www.google.com/search?q=watch+${encodeURIComponent(title)}+online`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between bg-black/30 border border-zinc-800 rounded-xl p-3 hover:bg-zinc-900 hover:border-zinc-600 transition-all group"
                  >
                    <span className="text-zinc-500 text-sm group-hover:text-white transition-colors">
                      Search on Google
                    </span>
                    <ExternalLink className="h-4 w-4 text-zinc-700 group-hover:text-zinc-400" />
                  </a>
                </div>

              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
