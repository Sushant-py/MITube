import { Search, Grid, Film, User, Menu } from 'lucide-react';
import { FeaturedHero } from './components/FeaturedHero';
import { VideoRow } from './components/VideoRow';

const trendingVideos = [
  {
    id: '1',
    title: 'Neon Dreams',
    thumbnail: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=800&h=450&fit=crop',
    duration: '1h 45m',
    year: '2026',
    rating: '9.4',
    genre: 'Sci-Fi'
  },
  {
    id: '2',
    title: 'The Last Frontier',
    thumbnail: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&h=450&fit=crop',
    duration: '2h 12m',
    year: '2025',
    rating: '8.9',
    genre: 'Adventure'
  },
  {
    id: '3',
    title: 'Urban Legends',
    thumbnail: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=800&h=450&fit=crop',
    duration: '1h 58m',
    year: '2026',
    rating: '9.2',
    genre: 'Thriller'
  },
  {
    id: '4',
    title: 'Velocity',
    thumbnail: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=450&fit=crop',
    duration: '1h 52m',
    year: '2025',
    rating: '8.7',
    genre: 'Action'
  }
];

const recommendedVideos = [
  {
    id: '6',
    title: 'Midnight Runner',
    thumbnail: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=450&fit=crop',
    duration: '1h 38m',
    year: '2025',
    rating: '8.8',
    genre: 'Drama'
  },
  {
    id: '7',
    title: 'Crystal Horizons',
    thumbnail: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=450&fit=crop',
    duration: '2h 18m',
    year: '2026',
    rating: '9.5',
    genre: 'Fantasy'
  },
  {
    id: '8',
    title: 'Digital Awakening',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=450&fit=crop',
    duration: '1h 55m',
    year: '2025',
    rating: '9.0',
    genre: 'Sci-Fi'
  },
  {
    id: '9',
    title: 'Shadow Protocol',
    thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&h=450&fit=crop',
    duration: '2h 02m',
    year: '2026',
    rating: '9.3',
    genre: 'Mystery'
  }
];

const actionVideos = [
  {
    id: '11',
    title: 'Thunder Strike',
    thumbnail: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=450&fit=crop',
    duration: '1h 42m',
    year: '2026',
    rating: '8.5',
    genre: 'Action'
  },
  {
    id: '12',
    title: 'Quantum Leap',
    thumbnail: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&h=450&fit=crop',
    duration: '2h 08m',
    year: '2025',
    rating: '8.9',
    genre: 'Sci-Fi'
  },
  {
    id: '13',
    title: 'Eclipse Protocol',
    thumbnail: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&h=450&fit=crop',
    duration: '1h 51m',
    year: '2026',
    rating: '9.1',
    genre: 'Thriller'
  },
  {
    id: '14',
    title: 'Crimson Sky',
    thumbnail: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=800&h=450&fit=crop',
    duration: '2h 15m',
    year: '2025',
    rating: '8.7',
    genre: 'Adventure'
  }
];

export default function App() {
  return (
    <div className="min-h-screen bg-black dark">
      <nav className="border-b border-emerald-500/20 bg-black/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-12">
              <div className="flex items-center gap-3">
                <Film className="h-8 w-8 text-emerald-500" />
                <h1 className="text-2xl text-emerald-500 tracking-wider border-l-2 border-emerald-500 pl-3">MITube</h1>
              </div>
              <div className="hidden lg:flex items-center gap-8 text-sm text-zinc-400">
                <a href="#" className="hover:text-emerald-400 transition-colors uppercase tracking-wider border-b-2 border-emerald-500 pb-1">Library</a>
                <a href="#" className="hover:text-emerald-400 transition-colors uppercase tracking-wider">Collections</a>
                <a href="#" className="hover:text-emerald-400 transition-colors uppercase tracking-wider">Discover</a>
                <a href="#" className="hover:text-emerald-400 transition-colors uppercase tracking-wider">Archive</a>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <button className="text-zinc-400 hover:text-emerald-400 transition-colors">
                <Search className="h-5 w-5" />
              </button>
              <button className="text-zinc-400 hover:text-emerald-400 transition-colors">
                <Grid className="h-5 w-5" />
              </button>
              <button className="h-10 w-10 border-2 border-emerald-500/50 bg-emerald-500/10 flex items-center justify-center hover:bg-emerald-500/20 transition-all rounded-lg">
                <User className="h-5 w-5 text-emerald-400" />
              </button>
              <button className="lg:hidden text-zinc-400 hover:text-emerald-400 transition-colors">
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="border-b-2 border-emerald-500/30 mb-12">
        <FeaturedHero />
      </div>

      <div className="pb-16">
        <VideoRow title="Trending This Week" videos={trendingVideos} />
        <VideoRow title="Curated For You" videos={recommendedVideos} />
        <VideoRow title="Action Collection" videos={actionVideos} />
      </div>

      <footer className="border-t border-emerald-500/20 bg-black/95 backdrop-blur-sm py-8 mt-12">
        <div className="px-8 text-center text-zinc-600 text-sm">
          <p>© 2026 MITube — Your Premium Video Library</p>
        </div>
      </footer>
    </div>
  );
}
