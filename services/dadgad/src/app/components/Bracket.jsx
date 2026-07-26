"use client";
import React, {
  useContext,
  useRef,
} from 'react';

import { Context } from '../context/BracketContext';
import P5Sketch from './p5Sketch';
import CheckIsIos from '../services/CheckIsIos';

function P5Image() {
  const [bracketContext] = useContext(Context);
  const p5Ref = useRef(null);
  const isIOS = CheckIsIos();

  const handleSketchReady = (p5Instance) => {
    p5Ref.current = p5Instance;
  };

  const downloadBracket = () => {
    if (p5Ref.current) {
      const filename = `dadgad_${bracketContext.values.artist_name}_bracket.png`;
      const canvas = p5Ref.current.canvas; // Get the raw canvas element

      if (isIOS) {
        // For iOS, open the image in a new tab
        const imgData = canvas.toDataURL('image/png'); // Get data URL of the canvas
        const newWindow = window.open(); // Open a new blank window
        if (newWindow) {
          newWindow.document.write(`<img src="${imgData}" style="max-width: 100%; height: auto;">`); // Write the image into the new window
          newWindow.document.title = filename; // Set the title of the new tab
          newWindow.document.close(); // Close the document stream
        } else {
          // Fallback if window.open is blocked (e.g., by a popup blocker)
          console.warn("Could not open new window. Popup blocker might be active.");
          // As a fallback, you could still try a direct download or alert the user
          // For simplicity, we'll just log a warning here.
        }
      } else {
        // For non-iOS devices (desktop, Android), use p5.js's saveCanvas for direct download
        p5Ref.current.saveCanvas(`dadgad_${bracketContext.values.artist_name}_bracket`, 'png');
      }

    } else {
      console.warn("p5.js sketch not ready yet.");
    }
  }

  return (
    <div className='bracket-canvas-continer'>
      {isIOS && (
        <p>Image may appear smaller on mobile. Click the button below to download to your device.</p>
      )}
      <button onClick={downloadBracket} className='btn btn-primary mb-3 ms-3'>
        Download Bracket
      </button>
      <P5Sketch onSketchReady={handleSketchReady}/>
    </div>
  );
}

export default P5Image;
