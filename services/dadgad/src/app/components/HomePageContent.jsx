function HomePageContent({
  classNames, 
  homeHeading = 'Welcome to Dadgad. Build the Ultimate Song Bracket for Your Favorite Artist',
  homeSubHeading = 'Pick your favorites, round by round. Crown your winner. Share your bracket with the world.',
  homeContent = 'Turn a musician’s discography into your own personal tournament. We rank the songs—your job is to pick the winners until one song is left standing. Once your bracket is complete, export and share it with friends.',
}) {
  return (
    <div className={classNames}>
      <div className="container mx-auto">
        <h1>{homeHeading}</h1>
        <h2>{homeSubHeading}</h2>
        <p className="text-left">{homeContent}</p>
      </div>
    </div>
  )
}

export default HomePageContent;
