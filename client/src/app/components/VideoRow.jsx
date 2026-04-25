import { VideoCard } from './VideoCard';

export function VideoRow({ title, videos }) {
  return (
    <div className="mb-16 px-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="h-px w-8 bg-emerald-500"></div>
        <h2 className="text-white uppercase tracking-widest">{title}</h2>
        <div className="h-px flex-1 bg-emerald-500/20"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {videos.map((video) => (
          <VideoCard key={video.id} {...video} />
        ))}
      </div>
    </div>
  );
}
