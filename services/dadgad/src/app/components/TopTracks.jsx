import React, { useContext } from 'react';
import Song from '../pages/Song';
import { Context } from '../context/BracketContext';
import { isObjectEmpty } from '../services/dataService';

function TopTracks() {
  const value = useContext(Context);
  const [state] = value;
  const bracketCreated = !isObjectEmpty(state.bracket);

  const songList = () => {
    const list = Object.prototype.hasOwnProperty.call(state.values, 'top_songs_list')
      ? (
        state.values.top_songs_list.map((song) => (
          <Song song={song} key={song.id} />
        ))
      )
      : null;
    return list;
  };
  return (bracketCreated === false ? <ol className="song-list">{songList()}</ol> : '');
}

export default TopTracks;
