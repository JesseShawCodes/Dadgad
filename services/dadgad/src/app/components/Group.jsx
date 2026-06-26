import { React, useContext } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import Matchup from './Matchup';
import { Context } from '../context/BracketContext';

function Group({ groupName, matchups, round }) {
  const value = useContext(Context);
  const [state] = value;

  if (!matchups?.roundMatchups) {
    return null;
  }

  const groupMatchups = matchups.roundMatchups;
  const roundProgress = state.bracket[groupName]?.[round]?.progress;
  return (
    <div className={groupName} key={groupName}>
      <h2 className="mt-1">
        {groupName}
        {roundProgress === 1 ? <FontAwesomeIcon icon={faCheckCircle} className="text-success" /> : null}
      </h2>
      <ul className="list-group">
        {groupMatchups.map((matchup, index) => (
          <li className="list-group-item border-0" key={matchup.matchupId}>
            <Matchup
              song1={matchup.attributes.song1}
              song2={matchup.attributes.song2}
              matchup={matchup}
              key={matchup.matchupId}
              groupName={groupName}
              index={index}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Group;

Group.propTypes = {
  round: PropTypes.string.isRequired,
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
