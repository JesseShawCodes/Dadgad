import React from 'react';
import { render } from '@testing-library/react';
import ArtistSearchCard from '../components/ArtistSearchCard'; // Adjust path if necessary

describe('ArtistSearchCard', () => {
  const mockArtist = {
    id: '1',
    type: 'artists',
    href: '/v1/catalog/us/artists/1',
    attributes: {
      genreNames: ['Pop'],
      name: 'Test Artist',
      url: 'https://example.com/test-artist',
      artwork: {
        url: 'https://example.com/artwork.jpg',
        width: 1000,
        height: 1000,
      },
    },
    relationships: {
      albums: {
        href: '/v1/catalog/us/artists/1/albums',
        data: [],
      },
    },
  };

  it('renders correctly with artwork', () => {
    const { asFragment } = render(<ArtistSearchCard artistResult={mockArtist} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly without artwork', () => {
    const artistWithoutArtwork = { ...mockArtist, attributes: { ...mockArtist.attributes, artwork: undefined } };
    const { asFragment } = render(<ArtistSearchCard artistResult={artistWithoutArtwork} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
