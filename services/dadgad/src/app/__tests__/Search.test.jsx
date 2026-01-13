
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SearchPage from '@/app/search/page';

// Mock the fetch function
global.fetch = jest.fn();

// Mock SWR
jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('SearchPage', () => {
  beforeEach(() => {
    fetch.mockClear();
    require('swr').default.mockClear();
  });

  it('renders the search page with initial elements', () => {
    require('swr').default.mockReturnValue({ data: null, error: null });
    render(<SearchPage />);
    
    expect(screen.getByText('Search for Artist')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
  });

  it('allows typing in the search input', () => {
    require('swr').default.mockReturnValue({ data: null, error: null });
    render(<SearchPage />);
    
    const input = screen.getByPlaceholderText('Search');
    fireEvent.change(input, { target: { value: 'test artist' } });
    
    expect(input.value).toBe('test artist');
  });

  it('shows loading state when search is submitted', async () => {
    require('swr').default.mockReturnValue({ data: null, error: null });
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ task_id: '123' }),
    });

    render(<SearchPage />);
    
    const input = screen.getByPlaceholderText('Search');
    fireEvent.change(input, { target: { value: 'test artist' } });
    
    const searchButton = screen.getByRole('button', { name: 'Search' });
    fireEvent.click(searchButton);
    
    await waitFor(() => {
      expect(screen.getByText('Submitting Search...')).toBeInTheDocument();
    });
  });

  it('shows skeleton loaders when polling is in PENDING state', async () => {
    require('swr').default.mockReturnValue({ 
      data: { status: 'PENDING' }, 
      error: null 
    });

    render(<SearchPage />);
    
    // Assuming that the task ID is set from a previous step in a real scenario
    // For this test, we directly set the SWR mock to a pending state.
    
    expect(screen.getByTestId('artist-card-skeleton')).toBeInTheDocument();
  });

  it('displays results when search is successful', async () => {
    const mockArtists = [
      { id: '1', attributes: { name: 'Artist 1', artwork: { url: 'url1' } } },
      { id: '2', attributes: { name: 'Artist 2', artwork: { url: 'url2' } } },
    ];

    require('swr').default.mockReturnValue({
      data: { 
        status: 'SUCCESS', 
        result: { 
          results: { 
            artists: { 
              data: mockArtists 
            } 
          } 
        } 
      },
      error: null,
    });

    render(<SearchPage />);

    await waitFor(() => {
      expect(screen.getByText('Artist 1')).toBeInTheDocument();
      expect(screen.getByText('Artist 2')).toBeInTheDocument();
    });
  });

  it('displays an error message when the search fails', async () => {
    require('swr').default.mockReturnValue({
      data: { status: 'FAILURE' },
      error: null,
    });

    render(<SearchPage />);

    await waitFor(() => {
      expect(screen.getByText('There was an error processing your search. Please try again.')).toBeInTheDocument();
    });
  });

  it('handles search submission error', async () => {
    const errorMessage = 'Failed to fetch';
    fetch.mockRejectedValueOnce(new Error(errorMessage));

    render(<SearchPage />);
    
    const input = screen.getByPlaceholderText('Search');
    fireEvent.change(input, { target: { value: 'test artist' } });
    
    const searchButton = screen.getByRole('button', { name: 'Search' });
    fireEvent.click(searchButton);
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('calls useSWR with correct refreshInterval logic', () => {
    const useSWRMock = require('swr').default;
    useSWRMock.mockReturnValue({ data: null, error: null });

    render(<SearchPage />);

    const swrOptions = useSWRMock.mock.calls[0][2];
    expect(swrOptions.refreshInterval).toBeInstanceOf(Function);

    expect(swrOptions.refreshInterval({ status: 'SUCCESS' })).toBe(0);
    expect(swrOptions.refreshInterval({ status: 'FAILURE' })).toBe(0);
    expect(swrOptions.refreshInterval({ status: 'PENDING' })).toBe(2000);
    expect(swrOptions.refreshInterval(null)).toBe(2000);
  });
});
