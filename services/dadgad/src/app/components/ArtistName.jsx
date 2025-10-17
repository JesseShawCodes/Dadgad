import { React, useContext } from 'react';
import { useSelector } from 'react-redux';

function ArtistName() {
  const state = useSelector(state => state.bracket);
  let artistName;
  if (typeof state !== 'undefined') {
    artistName = state.artist_name;
  }

  return (
    <h1>{artistName}</h1>
  );
}

export default ArtistName;
