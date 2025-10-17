import { React, useContext } from 'react';
import BackToTop from './BackToTop';
import ThemeButton from './ThemeButton';
import RoundCompleteConfirmation from './RoundCompleteConfirmation';

function FloatingControls() {
  return (
    <div className="floating-controls">
      <BackToTop />
      <RoundCompleteConfirmation />
      <ThemeButton />
    </div>
  );
}

export default FloatingControls;
