
import { render, screen } from '@testing-library/react';
import SongCardSkeleton from '../components/skeleton_loaders/SongCardSkeleton';

describe('SongCardSkeleton', () => {
  it('should render the skeleton loader', () => {
    render(<SongCardSkeleton />);
    
    expect(screen.getByTestId('song-card-skeleton')).toBeInTheDocument();

    const skeletonLines = screen.getAllByText('', { selector: '.skeleton-line' });
    expect(skeletonLines.length).toBe(2);
  });
});
