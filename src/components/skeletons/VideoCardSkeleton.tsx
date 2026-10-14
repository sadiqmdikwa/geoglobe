export function VideoCardSkeleton() {
  return (
    <div className="bg-gray-800/60 backdrop-blur-md rounded-xl md:rounded-2xl overflow-hidden shadow-xl border border-gray-700/60 flex flex-col relative before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent">
      {/* Thumbnail Skeleton */}
      <div className="relative aspect-video bg-gray-900/90 flex items-center justify-center overflow-hidden">
        <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-white/5 flex items-center justify-center">
          <div className="w-4 h-4 md:w-6 md:h-6 rounded-sm bg-white/10"></div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-3 md:p-5 flex flex-col flex-grow space-y-2 md:space-y-3">
        {/* Category badge */}
        <div className="h-3 bg-geoYellow/20 rounded w-20"></div>

        {/* Title lines */}
        <div className="space-y-1.5">
          <div className="h-4 bg-white/10 rounded w-full"></div>
          <div className="h-4 bg-white/10 rounded w-3/4"></div>
        </div>

        {/* Action Button */}
        <div className="mt-auto pt-2 flex gap-1.5 md:gap-2">
          <div className="h-8 md:h-10 bg-geoCyan/20 rounded-lg flex-grow"></div>
          <div className="h-8 w-8 md:h-10 md:w-10 bg-white/5 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}

export function VideoLibrarySkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="w-full">
      {/* Grid of Video Card Skeletons */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <VideoCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
