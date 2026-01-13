import { React, useContext } from 'react';
import { Context } from '../context/BracketContext';

function ArtistName() {
  const value = useContext(Context);
  const [state] = value;

  return (
    <h1 className="text-4xl font-bold mb-4">{state.values.artist_name}</h1>
  );
}

export default ArtistName;
