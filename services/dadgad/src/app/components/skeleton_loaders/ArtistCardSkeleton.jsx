function ArtistCardSkeleton() {
  return (
    <div className="mt-4 bg-white animate-pulse rounded-lg shadow-lg overflow-hidden max-w-sm w-full" data-testid="artist-card-skeleton">
      <div className="h-48 animate-pulse bg-gray-200 rounded-t" data-testid="skeleton-line"></div>
      <div className="p-4">
        <div className="h-6 animate-pulse bg-gray-200 rounded w-3/4 mb-3" data-testid="skeleton-line"></div>
        <div className="h-4 animate-pulse bg-gray-200 rounded w-full mb-2" data-testid="skeleton-line"></div>
      </div>
    </div>
  )
}

export default ArtistCardSkeleton;
