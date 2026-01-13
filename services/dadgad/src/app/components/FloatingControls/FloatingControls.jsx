import { React, useContext } from 'react';
import BackToTop from './BackToTop';
import ThemeButton from './ThemeButton';

function FloatingControls() {
  return (
    <div className="floating-controls">
      <BackToTop />
      <ThemeButton />
    </div>
  );
}

export default FloatingControls;
