import { React, useContext } from 'react';
import PropTypes from 'prop-types';
import MatchupSong from './Matchups/MatchupSong';
import { Context } from '../context/BracketContext';

export default function Matchup({
  song1, song2, matchup, groupName, index,
}) {
  const value = useContext(Context);
  const [state] = value;
  const championship = Object.keys(state.championshipBracket).length !== 0;

  const getWinner = () => {
    let winner;

    if (!championship) {
      winner = state.bracket[`${groupName}`][`round${matchup.round}`].roundMatchups[index].attributes.winner;
    } else {
      winner = state.championshipBracket[`round${state.round}`].roundMatchups[index].attributes.winner;
    }

    return winner
  }

  return (
    <>
      <div className="d-flex justify-content-between mb-2">
      <MatchupSong
        thissong={song1}
        opponent={song2}
        matchupId={matchup.matchupId}
        round={matchup.round}
        group={groupName}
        winner={getWinner()}
        key={`matchup_song_${song1.song.id}`}
      />
        <div>
          vs.
        </div>
      <MatchupSong
        thissong={song2}
        opponent={song1}
        matchupId={matchup.matchupId}
        round={matchup.round}
        group={groupName}
        winner={getWinner()}
        key={`matchup_song_${song2.song.id}`}
      />
      </div>
    </>
  );
}

Matchup.propTypes = {
  song1: PropTypes.shape({
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
  song2: PropTypes.shape({
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
