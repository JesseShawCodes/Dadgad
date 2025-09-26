
import { render, screen } from '@testing-library/react';
import ArtistCardSkeleton from '../components/skeleton_loaders/ArtistCardSkeleton';

describe('ArtistCardSkeleton', () => {
  it('should render the skeleton loader', () => {
    render(<ArtistCardSkeleton />);
    
    expect(screen.getByTestId('artist-card-skeleton')).toBeInTheDocument();

    const skeletonLines = screen.getAllByText('', { selector: '.skeleton-line' });
    expect(skeletonLines.length).toBe(3);
  });
});
