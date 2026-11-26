import React from 'react';
import { render, screen } from '@testing-library/react';
import ArtistName from '../components/ArtistName';
import { Context } from '../context/BracketContext';

jest.mock('next/navigation', () => ({
  useParams: () => ({ handle: 'Led%20Zeppelin' }),
}));

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

  it('decodes percent-encoded names from the API or URL', () => {
    const mockState = {
      values: {
        artist_name: 'Led%20Zeppelin',
      },
    };

    render(
      <Context.Provider value={[mockState]}>
        <ArtistName />
      </Context.Provider>
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Led Zeppelin');
  });
});
