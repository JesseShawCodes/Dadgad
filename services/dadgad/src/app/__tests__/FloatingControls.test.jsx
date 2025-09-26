
import { render, screen } from '@testing-library/react';
import FloatingControls from '../components/FloatingControls/FloatingControls';
import { ThemeProvider } from '../ThemeContext';

jest.mock('../components/FloatingControls/BackToTop', () => () => <div data-testid="back-to-top" />);
jest.mock('../components/FloatingControls/ThemeButton', () => () => <div data-testid="theme-button" />);

describe('FloatingControls', () => {
  it('should render the BackToTop and ThemeButton components', () => {
    render(
      <ThemeProvider>
        <FloatingControls />
      </ThemeProvider>
    );

    expect(screen.getByTestId('back-to-top')).toBeInTheDocument();
    expect(screen.getByTestId('theme-button')).toBeInTheDocument();
  });
});
