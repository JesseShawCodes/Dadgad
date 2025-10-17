import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import ArtistName from '../components/ArtistName';

describe('ArtistName', () => {
  const mockStore = configureStore([]);

  it('renders the artist name from the Redux store', () => {
    const store = mockStore({
      bracket: {
        artist_name: 'The Beatles',
      },
    });

    render(
      <Provider store={store}>
        <ArtistName />
      </Provider>
    );

    expect(screen.getByText('The Beatles')).toBeInTheDocument();
  });

  it('renders nothing when the artist name is not in the store', () => {
    const store = mockStore({
      bracket: {},
    });

    const { container } = render(
      <Provider store={store}>
        <ArtistName />
      </Provider>
    );

    expect(container.firstChild).toBeEmptyDOMElement();
  });
});