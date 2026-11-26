import { React, useContext } from 'react';
import { useParams } from 'next/navigation';
import { Context } from '../context/BracketContext';
import { normalizeArtistHandle } from '../services/artistHandle';

function ArtistName() {
  const value = useContext(Context);
  const [state] = value;
  const { handle } = useParams();
  const fromApi = state.values?.artist_name;
  const displayName = fromApi
    ? normalizeArtistHandle(fromApi)
    : normalizeArtistHandle(handle);

  return (
    <h1>{displayName}</h1>
  );
}

export default ArtistName;
