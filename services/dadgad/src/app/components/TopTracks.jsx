import React from 'react';
import Song from '../pages/Song';
import { isObjectEmpty } from '../services/dataService';
import { useSelector } from 'react-redux';

function TopTracks() {
  const bracket = useSelector(state => state.bracket);

  return (
    <>
      {isObjectEmpty(bracket.bracket) && (
        <ol className="song-list px-0">
          {bracket.topSongs?.map((song) => (
            <Song key={song.id} song={song} />
          ))}
        </ol>
      )}
    </>
  );
}

export default TopTracks;
