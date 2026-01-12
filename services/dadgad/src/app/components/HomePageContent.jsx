function HomePageContent({
  classNames, 
  homeHeading = 'Welcome to Dadgad. Build the Ultimate Song Bracket for Your Favorite Artist',
  homeSubHeading = 'Pick your favorites, round by round. Crown your winner. Share your bracket with the world.',
  homeContent = 'Turn a musician’s discography into your own personal tournament. We rank the songs—your job is to pick the winners until one song is left standing. Once your bracket is complete, export and share it with friends.',
}) {
  return (
    <div className={`flex flex-col items-center justify-center min-h-screen py-2 ${classNames}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-2xl">
        <h1 className="text-5xl font-extrabold leading-tight mb-4 text-gray-900 dark:text-white">
          {homeHeading}
        </h1>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-6 text-gray-700 dark:text-gray-200">
          {homeSubHeading}
        </h2>
        <p className="text-base sm:text-lg leading-relaxed text-gray-600 dark:text-gray-300">
          {homeContent}
        </p>
      </div>
    </div>
  )
}

export default HomePageContent;
