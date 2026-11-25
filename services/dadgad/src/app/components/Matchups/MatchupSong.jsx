"use client";
import { React, useContext, useState } from 'react';
import { useParams } from 'next/navigation';
import PropTypes from 'prop-types';

import MatchupSongButton from './MatchupSongButton';
import { Context } from '../../context/BracketContext';
import { applyLocalMatchupPick } from '../../services/bracketLocalUpdate';
import { selectMatchupWinnerRequest } from '../../api/client';

export default function MatchupSong({
  thissong, opponent, matchupId, round, group, winner,
}) {
  const { handle } = useParams();
  const [state, dispatch] = useContext(Context);
  const [boxShadow, setBoxShadow] = useState('none');
  const [submitting, setSubmitting] = useState(false);

  const selectWinner = async () => {
    if (submitting) {
      return;
    }

    setSubmitting(true);

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

    // Persist pick on the server when we have a bracket id (best-effort).
    const bracketId = state.values?.bracket_id;
    if (bracketId && thissong?.song?.id) {
      try {
        await selectMatchupWinnerRequest({
          bracket_id: bracketId,
          matchupId,
          selectedSong: thissong,
        });
      } catch (error) {
        console.error('Failed to persist matchup winner:', error);
      }
    }

    setSubmitting(false);
  };

  const winnerId = typeof winner !== 'undefined' && winner !== null ? winner.id : null;

  return (
    <MatchupSongButton
      thissong={thissong}
      boxShadow={boxShadow}
      setBoxShadow={setBoxShadow}
      selectWinner={selectWinner}
      winner={winnerId}
      disabled={submitting}
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
