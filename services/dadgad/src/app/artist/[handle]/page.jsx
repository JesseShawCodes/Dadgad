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
  return (
    <>
      <BracketContext>
        <ErrorBoundary>
          <div className="container-lg">
            <ArtistName />
            <ArtistPageForm />
            <TopTracks />
          </div>
        </ErrorBoundary>
      </BracketContext>
    </>
  )
}

export default ArtistPage;
