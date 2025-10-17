"use client"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckSquare } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';

const RoundCompleteConfirmation = () => {
  const progress = useSelector(state => state.bracket.progress);

  return(
    progress == 1 ?
      <div className="d-flex flex-column" id="">
        <button
          aria-label="Go to Next Round"
          title="Go to Next Round"
          id="next-round"
          className="btn-secondary"
          type="button"
        >
          <FontAwesomeIcon icon={faCheckSquare} className='text-success' />
        </button>
      </div>
      : null
  )
}

export default RoundCompleteConfirmation;