"use client"
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleUp } from '@fortawesome/free-solid-svg-icons';

function BackToTop() {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleScrollButtonVisibility = () => {
      if (window.scrollY > 500) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    };
    window.addEventListener('scroll', handleScrollButtonVisibility);
    handleScrollButtonVisibility(); // Call once on mount to set initial state

    return () => {
      window.removeEventListener('scroll', handleScrollButtonVisibility);
    };
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    showButton && (
      <div className="scrollToTop" id="back_to_top_container">
        <button
          aria-label="Back to Top"
          id="back_to_top"
          className="btn-secondary"
          onClick={handleScrollToTop}
          type="button"
        >
          <FontAwesomeIcon icon={faAngleUp} />
        </button>
      </div>
    )
  );
}

export default BackToTop;
