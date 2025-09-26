function SongCardSkeleton() {
  return (
    <div className="card shadow-lg overflow-hidden" style={{ width: "100%"}} data-testid="song-card-skeleton">
      <div className="card-body d-flex justify-content-between">
        <div className="h-custom-6 skeleton-line w-25 mb-3"></div>
        <div className="h-custom-6 skeleton-line w-25 mb-2"></div>
      </div>
    </div>
  )
}

export default SongCardSkeleton;
