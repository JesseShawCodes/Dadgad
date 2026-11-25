import { render, screen } from '@testing-library/react';
import Footer from '../components/Footer';

describe('Footer', () => {
  it('renders the footer component', () => {
    render(<Footer />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('displays the copyright text', () => {
    render(<Footer />);
    expect(screen.getByText(/© 2026/)).toBeInTheDocument();
  });
});
