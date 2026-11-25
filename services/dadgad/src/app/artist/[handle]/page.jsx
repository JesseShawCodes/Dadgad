"use client";
import {
  React,
} from 'react';

import { BracketContext } from '../../context/BracketContext';
import ErrorBoundary from '../../boundary/ErrorBoundary';
import ArtistName from '../../components/ArtistName';
import ArtistPageForm from '../../components/ArtistPageForm';
import TopTracks from '../../components/TopTracks';

function ArtistPage() {
  // Nested provider isolates reducer state per artist visit (see frontend-guidelines.md).
  return (
    <BracketContext>
      <ErrorBoundary>
        <div className="container py-4">
          <ArtistName />
          <ArtistPageForm />
          <TopTracks />
        </div>
      </ErrorBoundary>
    </BracketContext>
  );
}

export default ArtistPage;
