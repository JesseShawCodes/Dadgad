
import { render, screen } from '@testing-library/react';
import SongCardSkeleton from '../components/skeleton_loaders/SongCardSkeleton';

describe('SongCardSkeleton', () => {
  it('should render the skeleton loader', () => {
    render(<SongCardSkeleton />);
    
    const skeletonContainer = screen.getByTestId('song-card-skeleton');
    expect(skeletonContainer).toBeInTheDocument();

    const skeletonLinesContainer = skeletonContainer.querySelector('.p-4');
    expect(skeletonLinesContainer.children.length).toBe(2);
  });
});
