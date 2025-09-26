
import { render, screen } from '@testing-library/react';
import NavBar from '../NavBar';


describe('NavBar', () => {
  // Set up the environment variable before running the tests
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_NAME: 'Dadgad',
      NEXT_PUBLIC_API_ROOT_MEDIA: 'test.com'
    };
  });

  afterEach(() => {
    // Restore the original environment variables after all tests
    process.env = originalEnv;
  });

  it('renders the NavBar with brand, navigation links, and theme toggle button', () => {
    render(<NavBar />);

    // Check for the brand name
    expect(screen.getByText('Dadgad')).toBeInTheDocument();

    // Check for the logo
    const logo = screen.getByAltText('Dadgad logo');
    expect(logo).toBeInTheDocument();

  });
});
