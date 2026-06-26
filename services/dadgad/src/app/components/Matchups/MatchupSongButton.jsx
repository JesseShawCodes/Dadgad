import { React } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';

function MatchupSongButton({
  thissong, boxShadow, setBoxShadow, selectWinner, winner, isSelecting,
}) {
  const artwork = thissong.song.attributes.artwork || {};
  const bgColor = artwork.bgColor || '333333';
  const textColor = artwork.textColor1 || 'ffffff';
  const isWinner = winner == thissong.song.id;

  return (
    <button
      className="w-50 user-select-none btn"
      type="button"
      style={{
        color: `#${textColor}`,
        backgroundColor: `#${bgColor}`,
        backgroundImage: `linear-gradient(to left, #${bgColor} 0%, color-mix(in srgb, #${bgColor}, black 10%) 90%)`,
        boxShadow: boxShadow,
      }}
      onFocus={() =>
        setBoxShadow(`0 0 10px #${bgColor}, 0 0 10px #${textColor}`)
      }
      onBlur={() => setBoxShadow('none')}
      data-song-id={thissong.song.id}
      onClick={selectWinner}
      aria-busy={isSelecting}
    >
      {thissong.song.attributes.name}
      {' '}
      {isSelecting ? (
        <FontAwesomeIcon icon={faSpinner} className="fa-spin" aria-label="Saving selection" />
      ) : null}
      {!isSelecting && isWinner ? (
        <FontAwesomeIcon icon={faCheckCircle} className="text-success" />
      ) : null}
    </button>
  );
}

export default MatchupSongButton;
