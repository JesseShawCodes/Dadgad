import React from 'react';
import { render, screen } from '@testing-library/react';
import ArtistName from '../components/ArtistName';
import { Context } from '../context/BracketContext';

describe('ArtistName', () => {
  it('renders the artist name from context', () => {
    const mockState = {
      values: {
        artist_name: 'The Beatles',
      },
    };

    render(
      <Context.Provider value={[mockState]}>
        <ArtistName />
      </Context.Provider>
    );

    expect(screen.getByText('The Beatles')).toBeInTheDocument();
  });
});
