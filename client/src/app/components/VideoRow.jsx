import { VideoCard } from './VideoCard';

export function VideoRow({ title, videos, viewMode = 'grid', onWatch }) {
  if (!videos || videos.length === 0) return null;

  return (
    <div className="px-8 mb-12">
      <h2 className="text-white uppercase tracking-widest text-sm font-bold mb-6 flex items-center gap-3">
        <span className="w-6 h-0.5 bg-emerald-500 inline-block" />
        {title}
      </h2>

      {/* Grid or List layout */}
      <div className={viewMode === 'grid'
        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        : "flex flex-col gap-4"
      }>
        {videos.map(video => (
          <VideoCard 
            key={video.id} 
            {...video} 
            viewMode={viewMode} 
            onWatch={onWatch} 
          />
        ))}
      </div>
    </div>
  );
}