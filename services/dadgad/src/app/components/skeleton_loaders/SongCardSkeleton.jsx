function SongCardSkeleton() {
  return (
    <div className="bg-white animate-pulse rounded-lg shadow-lg overflow-hidden w-full" data-testid="song-card-skeleton">
      <div className="p-4 flex justify-between">
        <div className="h-6 bg-gray-300 rounded w-1/4 mb-3"></div>
        <div className="h-6 bg-gray-300 rounded w-1/4 mb-2"></div>
      </div>
    </div>
  )
}

export default SongCardSkeleton;
