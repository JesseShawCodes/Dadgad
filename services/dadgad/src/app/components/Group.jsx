import { React, useContext } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import Matchup from './Matchup';
import { Context } from '../context/BracketContext';
import { useSelector } from 'react-redux';

function Group({ groupName, matchups, round }) {
  const state = useSelector(state => state.bracket);

  const groupMatchups = matchups.roundMatchups;
  return (
    <div className={groupName} key={groupName}>
      <h2 className="mt-1">
        {groupName}
        {state.bracket[groupName][round].progress === 1 ? <FontAwesomeIcon icon={faCheckCircle} className="text-success" /> : null}

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
