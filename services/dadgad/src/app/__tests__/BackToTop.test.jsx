import { render, screen, fireEvent } from '@testing-library/react';
import BackToTop from '../components/FloatingControls/BackToTop';

const mockedScrollTo = jest.fn();
Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
Object.defineProperty(window, 'scrollTo', { value: mockedScrollTo });


describe('Back To Top', () => {
  it('should not show the button initially', () => {
    render(<BackToTop />);
    const button = screen.queryByRole('button', { name: /Back to Top/i });
    expect(button).not.toBeInTheDocument();
  });

  it('should show the button after scrolling down', () => {
    render(<BackToTop />);

    // Simulate scrolling past the 500px threshold
    Object.defineProperty(window, 'scrollY', { value: 501 });
    fireEvent.scroll(window);

    const button = screen.getByRole('button', { name: /Back to Top/i });
    expect(button).toBeInTheDocument();
  });

  it('should hide the button when scrolling back up', () => {
    render(<BackToTop />);

    Object.defineProperty(window, 'scrollY', { value: 501 });
    fireEvent.scroll(window);

    Object.defineProperty(window, 'scrollY', { value: 100 });
    fireEvent.scroll(window);

    const button = screen.queryByRole('button', { name: /Back to Top/i });
    expect(button).not.toBeInTheDocument();
  });

  it('should scroll to the top when the button is clicked', () => {
    render(<BackToTop />);

    Object.defineProperty(window, 'scrollY', { value: 501 });
    fireEvent.scroll(window);

    const button = screen.getByRole('button', { name: /Back to Top/i });

    fireEvent.click(button);

    expect(mockedScrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });
});
