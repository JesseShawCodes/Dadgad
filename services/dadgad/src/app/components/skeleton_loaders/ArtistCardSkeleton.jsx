function ArtistCardSkeleton() {
  return (
    <div className="card shadow-lg overflow-hidden" style={{maxWidth:"24rem", width: "100%"}} data-testid="artist-card-skeleton">
      <div className="h-custom-48 skeleton-line rounded-top"></div>
      <div className="card-body p-4">
        <div className="h-custom-6 skeleton-line w-75 mb-3"></div>
        <div className="h-custom-4 skeleton-line w-100 mb-2"></div>
      </div>
    </div>
  )
}

export default ArtistCardSkeleton;
