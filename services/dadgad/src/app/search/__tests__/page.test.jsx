import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import SearchPage from '../page';
import { jsonServerApi } from '../../services/jsonServerApi';

jest.mock('../../components/ArtistSearchCard', () => {
  return function MockArtistSearchCard({ artistResult }) {
    return <div>{artistResult.attributes.name}</div>;
  };
});

function renderSearchPage() {
  const store = configureStore({
    reducer: {
      [jsonServerApi.reducerPath]: jsonServerApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(jsonServerApi.middleware),
  });

  return render(
    <Provider store={store}>
      <SearchPage />
    </Provider>,
  );
}

describe('SearchPage', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders the search page with initial elements', () => {
    renderSearchPage();

    expect(screen.getByText('Search for Artist')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
  });

  it('allows typing in the search input', () => {
    renderSearchPage();

    const input = screen.getByPlaceholderText('Search');
    fireEvent.change(input, { target: { value: 'test artist' } });

    expect(input.value).toBe('test artist');
  });

  it('shows loading state when search is submitted', async () => {
    fetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ task_id: '123' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    fetch.mockResolvedValue(
      new Response(JSON.stringify({ status: 'PENDING' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    renderSearchPage();

    const input = screen.getByPlaceholderText('Search');
    fireEvent.change(input, { target: { value: 'test artist' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));

    await waitFor(() => {
      expect(screen.getByText('Submitting Search...')).toBeInTheDocument();
    });
  });

  it('displays results when search is successful', async () => {
    const mockArtists = [
      { id: '1', attributes: { name: 'Artist 1', artwork: { url: 'url1' } } },
      { id: '2', attributes: { name: 'Artist 2', artwork: { url: 'url2' } } },
    ];

    fetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ task_id: 'task-1' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    fetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          status: 'SUCCESS',
          result: {
            results: {
              artists: {
                data: mockArtists,
              },
            },
          },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );

    renderSearchPage();

    fireEvent.change(screen.getByPlaceholderText('Search'), {
      target: { value: 'artist' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));

    await waitFor(() => {
      expect(screen.getByText('Artist 1')).toBeInTheDocument();
      expect(screen.getByText('Artist 2')).toBeInTheDocument();
    });
  });

  it('displays an error message when the search fails', async () => {
    fetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ task_id: 'task-fail' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    fetch.mockResolvedValue(
      new Response(JSON.stringify({ status: 'FAILURE' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    renderSearchPage();

    fireEvent.change(screen.getByPlaceholderText('Search'), {
      target: { value: 'artist' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));

    await waitFor(() => {
      expect(
        screen.getByText(
          'There was an error processing your search. Please try again.',
        ),
      ).toBeInTheDocument();
    });
  });

  it('handles search submission error', async () => {
    fetch.mockRejectedValueOnce(new Error('Failed to fetch'));

    renderSearchPage();

    fireEvent.change(screen.getByPlaceholderText('Search'), {
      target: { value: 'test artist' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch|Search failed/i)).toBeInTheDocument();
    });
  });
});
