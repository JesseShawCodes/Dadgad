"use client";
import { React, useContext, useState } from 'react';
import { useParams } from 'next/navigation';
import PropTypes from 'prop-types';

import MatchupSongButton from './MatchupSongButton';
import { Context } from '../../context/BracketContext';
import { applyLocalMatchupPick } from '../../services/bracketLocalUpdate';

export default function MatchupSong({
  thissong, opponent, matchupId, round, group, winner,
}) {
  const { handle } = useParams();
  const [state, dispatch] = useContext(Context);
  const [boxShadow, setBoxShadow] = useState('none');

  const selectWinner = () => {
    applyLocalMatchupPick({
      dispatch,
      state,
      thissong,
      opponent,
      matchupId,
      round,
      group,
    });

    dispatch({
      type: 'setUserBracket',
      payload: {
        userBracket: {
          artist: handle,
          bracket: state.bracket,
          round: state.round,
          currentRoundProgres: state.currentRoundProgres,
        },
      },
    });
  };

  winner = typeof (winner) !== "undefined" ? winner.id : null;

  return (
    <MatchupSongButton
      thissong={thissong}
      boxShadow={boxShadow}
      setBoxShadow={setBoxShadow}
      selectWinner={selectWinner}
      winner={winner}
    />
  );
}

MatchupSong.propTypes = {
  thissong: PropTypes.shape({
    id: PropTypes.string.isRequired,
    rank: PropTypes.number.isRequired,
    attributes: PropTypes.shape({
      name: PropTypes.string.isRequired,
      albumName: PropTypes.string.isRequired,
      artistName: PropTypes.string.isRequired,
      artwork: PropTypes.shape({
        textColor1: PropTypes.string.isRequired,
        bgColor: PropTypes.string.isRequired,
        url: PropTypes.string.isRequired,
      }),
    }),
  }).isRequired,
  opponent: PropTypes.shape({
    id: PropTypes.string.isRequired,
    rank: PropTypes.number.isRequired,
    attributes: PropTypes.shape({
      name: PropTypes.string.isRequired,
      albumName: PropTypes.string.isRequired,
      artistName: PropTypes.string.isRequired,
      artwork: PropTypes.shape({
        textColor1: PropTypes.string.isRequired,
        bgColor: PropTypes.string.isRequired,
        url: PropTypes.string.isRequired,
      }),
    }),
  }).isRequired,
};
