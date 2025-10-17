"use client"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckSquare } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';
import { usePathname } from 'next/navigation';

const RoundCompleteConfirmation = () => {
  const progress = useSelector(state => state.bracket.progress);
  const pathname = usePathname();
  const isArtistPage = pathname.startsWith('/artist/');

  return(
    progress === 1 && isArtistPage ?
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