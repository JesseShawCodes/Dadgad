import React from 'react';
import PropTypes from 'prop-types';
import Image from 'next/image';

export default function Song({ song }) {
  const dimensions = {
    '{w}': 70,
    '{h}': 70,
  };
  return (
    <li className="d-flex justify-content-between song-row" style={{ color: `#${song.attributes.artwork.textColor1}`, backgroundColor: `#${song.attributes.artwork.bgColor}` }}>
      <Image className="rounded" src={`${song.attributes.artwork.url.replace(/{w}|{h}/g, (match) => dimensions[match])}`} alt={`${song.attributes.albumName} Album Cover`} width={70} height={70} />
      <div>
        {song.attributes.name }
        -
        {song.attributes.albumName}
      </div>
    </li>
  );
}

Song.propTypes = {
  song: PropTypes.shape({
    attributes: PropTypes.shape({
      name: PropTypes.string.isRequired,
      albumName: PropTypes.string.isRequired,
      artwork: PropTypes.shape({
        textColor1: PropTypes.string.isRequired,
        bgColor: PropTypes.string.isRequired,
        url: PropTypes.string.isRequired,
      }),
    }),
  }).isRequired,
};
