import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Grid, List, Film, User, Menu, X, PlayCircle, History, LogOut } from 'lucide-react';
import { FeaturedHero } from './components/FeaturedHero';
import { VideoRow }     from './components/VideoRow';
import { VideoModal }   from './components/VideoModal';
import { fetchMovies, getImageUrl } from '../utils/tmdb';
import { useAuth } from '../context/AuthContext';
import { AuthModal }    from './components/AuthModal';

// ─── Reusable IntersectionObserver hook ───────────────────────────────────────
function useSentinel(callback) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) callback(); },
      { rootMargin: '200px' }   // trigger 200 px before the element appears
    );
    obs.observe(el);
    return () => obs.disconnect();
  });          
  return ref;
}

// ─── Format a raw TMDB movie object into the shape VideoRow / VideoCard expect ─
function fmt(m, genre) {
  return {
    id:          m.id,
    title:       m.title || m.name,
    thumbnail:   getImageUrl(m.backdrop_path || m.poster_path, 'w1280'),
    poster:      getImageUrl(m.poster_path, 'w500'),
    description: m.overview,
    duration:    '2h 15m',
    year:        (m.release_date || m.first_air_date || '2026').slice(0, 4),
    rating:      m.vote_average ? Number(m.vote_average).toFixed(1) : 'N/A',
    genre,
  };
}

export default function App() {
  // ── Core state ────────────────────────────────────────────────────────────
  const [trending,     setTrending]     = useState([]);
  const [actionVideos, setActionVideos] = useState([]);
  const [sciFiVideos,  setSciFiVideos]  = useState([]);
  const [topRated,     setTopRated]     = useState([]);
  
  // Auth State
  const { user, logout } = useAuth(); 
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Per-category page cursors
  const pages = useRef({ trending: 1, action: 1, scifi: 1, top: 1, discover: 1 });

  // Which categories still have pages left on the server
  const hasMore = useRef({ trending: true, action: true, scifi: true, top: true, discover: true });

  const [isLoading,       setIsLoading]       = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [viewMode,        setViewMode]        = useState('grid');
  const [activeNav,       setActiveNav]       = useState('Library');

  // ── Search state ──────────────────────────────────────────────────────────
  const [searchOpen,     setSearchOpen]    = useState(false);
  const [searchQuery,   setSearchQuery]   = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching,   setIsSearching]   = useState(false);

  // ── Discover filter ───────────────────────────────────────────────────────
  const [activeGenre,   setActiveGenre]   = useState('All');
  const [discoverList,  setDiscoverList]  = useState([]);

  // ── UI toggles ────────────────────────────────────────────────────────────
  const [userMenuOpen,   setUserMenuOpen]   = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ── Modal state ───────────────────────────────────────────────────────────
  const [modalOpen,     setModalOpen]     = useState(false);
  const [trailerKey,    setTrailerKey]    = useState(null);
  const [selectedTitle, setSelectedTitle] = useState('');

  // ─── Initial load ──────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const [t, a, s, r] = await Promise.all([
          fetchMovies.getTrending(1),
          fetchMovies.getAction(1),
          fetchMovies.getSciFi(1),
          fetchMovies.getTopRated(1),
        ]);
        setTrending(t.map(m => fmt(m, 'Trending')));
        setActionVideos(a.map(m => fmt(m, 'Action')));
        setSciFiVideos(s.map(m => fmt(m, 'Sci-Fi')));
        setTopRated(r.map(m => fmt(m, 'Classic')));
      } catch (err) {
        console.error('Initial fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // ─── Infinite — Library tab ────────────────────────────────────────
  const loadMoreLibrary = useCallback(async () => {
    if (isFetchingMore) return;
    const anyLeft =
      hasMore.current.trending ||
      hasMore.current.action   ||
      hasMore.current.scifi    ||
      hasMore.current.top;
    if (!anyLeft) return;

    setIsFetchingMore(true);
    try {
      const fetches = await Promise.allSettled([
        hasMore.current.trending
          ? fetchMovies.getTrending(pages.current.trending + 1)
          : Promise.resolve([]),
        hasMore.current.action
          ? fetchMovies.getAction(pages.current.action + 1)
          : Promise.resolve([]),
        hasMore.current.scifi
          ? fetchMovies.getSciFi(pages.current.scifi + 1)
          : Promise.resolve([]),
        hasMore.current.top
          ? fetchMovies.getTopRated(pages.current.top + 1)
          : Promise.resolve([]),
      ]);

      const [tRes, aRes, sRes, rRes] = fetches.map(r =>
        r.status === 'fulfilled' ? r.value : []
      );

      if (tRes.length) {
        setTrending(prev => [...prev, ...tRes.map(m => fmt(m, 'Trending'))]);
        pages.current.trending += 1;
      } else { hasMore.current.trending = false; }

      if (aRes.length) {
        setActionVideos(prev => [...prev, ...aRes.map(m => fmt(m, 'Action'))]);
        pages.current.action += 1;
      } else { hasMore.current.action = false; }

      if (sRes.length) {
        setSciFiVideos(prev => [...prev, ...sRes.map(m => fmt(m, 'Sci-Fi'))]);
        pages.current.scifi += 1;
      } else { hasMore.current.scifi = false; }

      if (rRes.length) {
        setTopRated(prev => [...prev, ...rRes.map(m => fmt(m, 'Classic'))]);
        pages.current.top += 1;
      } else { hasMore.current.top = false; }

    } catch (err) {
      console.error('loadMoreLibrary error:', err);
    } finally {
      setIsFetchingMore(false);
    }
  }, [isFetchingMore]);

  const librarySentinelRef = useSentinel(loadMoreLibrary);

  // ─── Infinite scroll — Discover tab ───────────────────────────────────────
  useEffect(() => {
    pages.current.discover = 1;
    hasMore.current.discover = true;
    setDiscoverList([]);

    (async () => {
      setIsFetchingMore(true);
      try {
        let data = [];
        if (activeGenre === 'All')     data = await fetchMovies.getTrending(1);
        else if (activeGenre === 'Action') data = await fetchMovies.getAction(1);
        else if (activeGenre === 'Sci-Fi') data = await fetchMovies.getSciFi(1);
        else if (activeGenre === 'Classics') data = await fetchMovies.getTopRated(1);
        setDiscoverList(data.map(m => fmt(m, activeGenre)));
      } finally {
        setIsFetchingMore(false);
      }
    })();
  }, [activeGenre]);

  const loadMoreDiscover = useCallback(async () => {
    if (isFetchingMore || !hasMore.current.discover) return;
    setIsFetchingMore(true);
    try {
      const nextPage = pages.current.discover + 1;
      let data = [];
      if (activeGenre === 'All')       data = await fetchMovies.getTrending(nextPage);
      else if (activeGenre === 'Action')  data = await fetchMovies.getAction(nextPage);
      else if (activeGenre === 'Sci-Fi')  data = await fetchMovies.getSciFi(nextPage);
      else if (activeGenre === 'Classics') data = await fetchMovies.getTopRated(nextPage);

      if (data.length === 0) {
        hasMore.current.discover = false;
      } else {
        setDiscoverList(prev => [...prev, ...data.map(m => fmt(m, activeGenre))]);
        pages.current.discover = nextPage;
      }
    } catch (err) {
      console.error('loadMoreDiscover error:', err);
    } finally {
      setIsFetchingMore(false);
    }
  }, [isFetchingMore, activeGenre]);

  const discoverSentinelRef = useSentinel(loadMoreDiscover);

  // ─── Search with debounce ──────────────────────────────────────────────────
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); setIsSearching(false); return; }
    setIsSearching(true);
    const t = setTimeout(async () => {
      try {
        const results = await fetchMovies.searchMovies(searchQuery);
        setSearchResults(results.map(m => fmt(m, 'Result')));
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // ─── Trailer modal ─────────────────────────────────────────────────────────
  const handleWatchTrailer = (movieId, title) => {
    setSelectedTitle(title);
    setTrailerKey(movieId);
    setModalOpen(true);
  };

  // ─── Content renderer ──────────────────────────────────────────────────────
  const navLinks      = ['Library', 'Collections', 'Discover', 'Archive'];
  const discoverGenres = ['All', 'Action', 'Sci-Fi', 'Classics'];

  const FetchingMore = () => isFetchingMore ? (
    <div className="flex justify-center py-10">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
    </div>
  ) : null;

  const EndOfFeed = ({ show }) => show ? (
    <p className="text-center text-zinc-700 text-xs uppercase tracking-widest py-10">
      You have reached the end
    </p>
  ) : null;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center text-emerald-500 py-32 flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
          <p className="tracking-widest uppercase font-medium">Connecting to Database...</p>
        </div>
      );
    }

    switch (activeNav) {
      case 'Library': {
        const allExhausted =
          !hasMore.current.trending &&
          !hasMore.current.action   &&
          !hasMore.current.scifi    &&
          !hasMore.current.top;

        return (
          <>
            <div className="border-b-2 border-emerald-500/30 mb-12">
              {trending.length > 0 && (
                <FeaturedHero movie={trending[0]} onWatch={handleWatchTrailer} />
              )}
            </div>

            <VideoRow title="Trending worldwide"   videos={trending}                viewMode={viewMode} onWatch={handleWatchTrailer} />
            <VideoRow title="Top rated all-time"   videos={topRated}                viewMode={viewMode} onWatch={handleWatchTrailer} />
            <VideoRow title="Now playing: Sci-Fi"  videos={sciFiVideos}             viewMode={viewMode} onWatch={handleWatchTrailer} />
            <VideoRow title="Action collection"    videos={actionVideos}            viewMode={viewMode} onWatch={handleWatchTrailer} />

            <div ref={librarySentinelRef} className="h-1" aria-hidden="true" />
            <FetchingMore />
            <EndOfFeed show={allExhausted} />
          </>
        );
      }

      case 'Discover': {
        const discoverExhausted = !hasMore.current.discover;
        return (
          <div className="pt-8 px-8">
            <div className="flex gap-4 mb-10 overflow-x-auto pb-2 scrollbar-hide">
              {discoverGenres.map(genre => (
                <button
                  key={genre}
                  onClick={() => setActiveGenre(genre)}
                  className={`flex-shrink-0 px-8 py-3 rounded-full font-bold tracking-wider uppercase transition-all ${
                    activeGenre === genre
                      ? 'bg-emerald-500 text-black'
                      : 'border border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/10'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>

            <VideoRow
              title={`Explore: ${activeGenre}`}
              videos={discoverList}
              viewMode={viewMode}
              onWatch={handleWatchTrailer}
            />

            <div ref={discoverSentinelRef} className="h-1" aria-hidden="true" />
            <FetchingMore />
            <EndOfFeed show={discoverExhausted} />
          </div>
        );
      }

      case 'Collections':
        return (
          <div className="px-8 py-24 max-w-4xl mx-auto">
            <div className="bg-zinc-900/50 border-2 border-dashed border-emerald-500/20 rounded-2xl p-12 text-center flex flex-col items-center">
              <div className="h-20 w-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
                <PlayCircle className="h-10 w-10 text-emerald-500" />
              </div>
              <h2 className="text-3xl text-white font-bold mb-4 tracking-tight">Your Private Watchlist</h2>
              <p className="text-zinc-400 max-w-md mx-auto mb-8 text-lg">
                Create custom playlists, save favourites, and track what you want to watch next. Sign in to sync your collection.
              </p>
              
              {/* WIRED UP THE CONDITIONAL BUTTON HERE */}
              {!user ? (
                <button 
                  onClick={() => setAuthModalOpen(true)}
                  className="bg-emerald-500 text-black px-10 py-4 rounded-lg font-bold uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                >
                  Sign in to save
                </button>
              ) : (
                <p className="text-emerald-500 font-bold tracking-widest uppercase">
                  Fetching your saved movies...
                </p>
              )}
            </div>
          </div>
        );

      case 'Archive':
        return (
          <div className="px-8 py-24 max-w-4xl mx-auto">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-12 text-center flex flex-col items-center">
              <div className="h-20 w-20 bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                <History className="h-10 w-10 text-zinc-500" />
              </div>
              <h2 className="text-3xl text-white font-bold mb-4">Watch history</h2>
              <p className="text-zinc-500 max-w-md mx-auto text-lg">
                Movies you have completed will be archived here.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black dark" onClick={() => setUserMenuOpen(false)}>

      {/* ── Search Overlay ───────────────────────────────────────────────── */}
      {searchOpen && (
        <div className="fixed inset-0 z-[95] bg-zinc-950/95 backdrop-blur-2xl flex flex-col pt-10 lg:pt-20 px-6 overflow-y-auto">
          <div className="w-full max-w-5xl mx-auto flex items-center gap-4 border-b-2 border-emerald-500 pb-4 sticky top-0 bg-zinc-950/90 z-10 pt-4">
            <Search className="h-8 w-8 text-emerald-400 flex-shrink-0" />
            <input
              autoFocus
              type="text"
              placeholder="Search by title..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-white text-2xl lg:text-3xl outline-none placeholder:text-zinc-600 font-light"
            />
            <button
              onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
              className="hover:rotate-90 transition-transform flex-shrink-0"
            >
              <X className="h-8 w-8 text-zinc-400 hover:text-emerald-400" />
            </button>
          </div>

          <div className="w-full max-w-7xl mx-auto mt-10 pb-20">
            {isSearching ? (
              <div className="text-center text-emerald-500 py-10 animate-pulse uppercase tracking-widest">
                Searching the globe...
              </div>
            ) : searchQuery && searchResults.length === 0 ? (
              <div className="text-center text-zinc-500 py-20 text-xl">
                No movies found for{' '}
                <span className="text-emerald-400">"{searchQuery}"</span>
              </div>
            ) : searchQuery ? (
              <VideoRow
                title={`Results for "${searchQuery}"`}
                videos={searchResults}
                viewMode={viewMode}
                onWatch={handleWatchTrailer}
              />
            ) : (
              <div className="text-center text-zinc-600 py-20 text-lg uppercase tracking-widest">
                Type a movie title to explore the global database
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Mobile Drawer ────────────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[90] bg-black/95 backdrop-blur-md flex flex-col gap-6 p-8 pt-24 lg:hidden">
          <button className="absolute top-6 right-6" onClick={() => setMobileMenuOpen(false)}>
            <X className="h-6 w-6 text-zinc-400" />
          </button>
          {navLinks.map(link => (
            <button
              key={link}
              onClick={() => { setActiveNav(link); setMobileMenuOpen(false); setSearchQuery(''); }}
              className={`text-left text-2xl uppercase tracking-widest font-bold transition-colors ${
                activeNav === link ? 'text-emerald-400 pl-4 border-l-4 border-emerald-400' : 'text-zinc-500'
              }`}
            >
              {link}
            </button>
          ))}
        </div>
      )}

      {/* ── Navbar ───────────────────────────────────────────────────────── */}
      <nav className="border-b border-emerald-500/20 bg-black/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-16">
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => { setActiveNav('Library'); setSearchQuery(''); }}
            >
              <Film className="h-8 w-8 text-emerald-500 group-hover:scale-110 transition-transform" />
              <h1 className="text-2xl text-emerald-500 tracking-wider font-black border-l-2 border-emerald-500 pl-3">
                MITube
              </h1>
            </div>

            <div className="hidden lg:flex items-center gap-10 text-sm font-bold text-zinc-400">
              {navLinks.map(link => (
                <button
                  key={link}
                  onClick={() => { setActiveNav(link); setSearchQuery(''); }}
                  className={`hover:text-emerald-400 transition-colors uppercase tracking-widest ${
                    activeNav === link
                      ? 'text-emerald-400 border-b-2 border-emerald-500 pb-2'
                      : 'pb-2'
                  }`}
                >
                  {link}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setSearchOpen(true)}
              className="text-zinc-400 hover:text-emerald-400 transition-colors"
            >
              <Search className="h-5 w-5" />
            </button>

            {(activeNav === 'Library' || activeNav === 'Discover') && (
              <button
                onClick={() => setViewMode(v => v === 'grid' ? 'list' : 'grid')}
                className="text-zinc-400 hover:text-emerald-400 transition-colors"
                title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
              >
                {viewMode === 'grid'
                  ? <List className="h-5 w-5" />
                  : <Grid className="h-5 w-5" />}
              </button>
            )}

            <div className="relative">
              {user ? (
                // IF LOGGED IN: Show their Avatar or Initial
                <>
                  <button onClick={e => { e.stopPropagation(); setUserMenuOpen(o => !o); }}
                    className="h-10 w-10 border-2 border-emerald-500 bg-zinc-900 flex items-center justify-center hover:scale-105 transition-all rounded-full overflow-hidden">
                    {user.avatar ? (
                      <img src={user.avatar} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-emerald-400 font-bold uppercase">{user.username.charAt(0)}</span>
                    )}
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-14 w-56 bg-zinc-950 border border-emerald-500/30 rounded-xl overflow-hidden shadow-2xl z-50">
                      <div className="p-4 border-b border-zinc-800">
                        <p className="text-white font-bold truncate">@{user.username}</p>
                        <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                      </div>
                      <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                // IF NOT LOGGED IN: Clicking opens the Auth Modal
                <button onClick={() => setAuthModalOpen(true)}
                  className="px-6 py-2 border-2 border-emerald-500/50 bg-emerald-500/10 flex items-center justify-center hover:bg-emerald-500 hover:text-black text-emerald-400 font-bold tracking-widest uppercase transition-all rounded-full">
                  Sign In
                </button>
              )}
            </div>

            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden text-zinc-400 hover:text-emerald-400 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="min-h-[70vh]">
        {renderContent()}
      </div>

      <footer className="border-t border-emerald-500/20 bg-black/95 py-12 mt-auto">
        <div className="px-8 text-center flex flex-col items-center gap-4">
          <Film className="h-8 w-8 text-zinc-800" />
          <p className="text-zinc-600 text-sm tracking-widest uppercase font-bold">
            © 2026 MITube Entertainment
          </p>
        </div>
      </footer>

      {/* ── Auth Modal ───────────────────────────────────────────────────── */}
      <div className="relative z-[120]">
        <AuthModal 
          isOpen={authModalOpen} 
          onClose={() => setAuthModalOpen(false)} 
        />
      </div>

      {/* ── Trailer modal — highest z-index so it clears everything ─────── */}
      <div className="relative z-[110]">
        <VideoModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          movieId={trailerKey}
          title={selectedTitle}
        />
      </div>
    </div>
  );
}