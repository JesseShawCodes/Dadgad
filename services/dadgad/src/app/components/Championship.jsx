import { React, useContext } from 'react';
import PropTypes from 'prop-types';
import Matchup from './Matchup';
import { Context } from '../context/BracketContext';

function Championship() {
  const value = useContext(Context);
  const [state] = value;

  return (
    <>
      {
        state.champion ? null : <div key="Championship Round">
        <div>
          {state.championshipBracket[`round${state.round}`].roundMatchups.map((matchup, index) => (
            <Matchup
              song1={matchup.attributes.song1}
              song2={matchup.attributes.song2}
              matchup={matchup}
              key={matchup.matchupId}
              groupName="Championship Round"
              index={index}
            />
          ))}
        </div>
      </div>
      }
    </>
  );
}

export default Championship;

Championship.propTypes = {
  groupName: PropTypes.shape({
    name: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired,
  }).isRequired,
  matchups: PropTypes.shape({
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
