"use client"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckSquare } from '@fortawesome/free-solid-svg-icons';
import { useSelector, useDispatch } from 'react-redux';
import { usePathname } from 'next/navigation';

// JSON Server API
import { useCreateNextRoundMutation } from '../../services/jsonServerApi';


const RoundCompleteConfirmation = () => {
  const bracket = useSelector(state => state.bracket);
  const pathname = usePathname();
  const isArtistPage = pathname.startsWith('/artist/');
  const [nextRound, { data: matchups, isLoading }] = useCreateNextRoundMutation();
  const dispatch = useDispatch();

  const nextRoundSubmit = () => {
    console.log("NEXT ROUND");
    var finishedRound = bracket.bracket;
    dispatch(nextRound(finishedRound));
  }

  return(
    bracket.progress === 1 && isArtistPage ?
      <div className="d-flex flex-column" id="">
        {/* On click - run the post */}
        <button
          aria-label="Go to Next Round"
          title="Go to Next Round"
          id="next-round"
          className="btn-secondary"
          type="button"
          onClick={nextRoundSubmit}
        >
          <FontAwesomeIcon icon={faCheckSquare} className='text-success' />
        </button>
      </div>
      : null
  )
}

export default RoundCompleteConfirmation;