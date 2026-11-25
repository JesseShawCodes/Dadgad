import { React } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';

function MatchupSongButton({
  thissong, boxShadow, setBoxShadow, selectWinner, winner, disabled = false,
}) {
  const artwork = thissong.song.attributes.artwork || {};
  const bgColor = artwork.bgColor || '333333';
  const textColor = artwork.textColor1 || 'ffffff';
  const isWinner = winner == thissong.song.id;
  const songName = thissong.song.attributes.name;

  return (
    <button
      className="w-50 user-select-none btn"
      type="button"
      aria-label={`Select ${songName} as winner`}
      aria-pressed={isWinner}
      disabled={disabled}
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
    >
      {songName}
      {' '}
      {isWinner ? (
        <FontAwesomeIcon icon={faCheckCircle} className="text-success" aria-hidden="true" />
      ) : null}
    </button>
  );
}

export default MatchupSongButton;
