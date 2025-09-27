import { React } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';

function MatchupSongButton({thissong, boxShadow, setBoxShadow, selectWinner, winner}) {
  const bgColor = thissong.song.attributes.artwork.bgColor;
  return (
    <button className="w-50 user-select-none btn" 
      style={{ 
        color: `#${thissong.song.attributes.artwork.textColor1}`, 
        backgroundColor: `#${bgColor}`,
        boxShadow: boxShadow,
      }}
      onFocus={() =>
        setBoxShadow(`0 0 10px #${bgColor}, 0 0 10px #${thissong.song.attributes.artwork.textColor1}`)
      }
      onBlur={() => setBoxShadow('none')}
    data-song-id={thissong.song.id} onClick={selectWinner}>
      {thissong.song.attributes.name} { winner == thissong.song.id ? <FontAwesomeIcon icon={faCheckCircle} className='text-success' /> : null }
    </button>
  );
}

export default MatchupSongButton;
