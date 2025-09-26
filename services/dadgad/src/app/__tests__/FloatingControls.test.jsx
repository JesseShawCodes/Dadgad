
import { render, screen } from '@testing-library/react';
import FloatingControls from '../components/FloatingControls/FloatingControls';
import { ThemeProvider } from '../ThemeContext';

jest.mock('../components/FloatingControls/BackToTop', () => {
  const MockBackToTop = () => <div data-testid="back-to-top" />;
  MockBackToTop.displayName = 'MockBackToTop';
  return MockBackToTop;
});
jest.mock('../components/FloatingControls/ThemeButton', () => {
  const MockThemeButton = () => <div data-testid="theme-button" />;
  MockThemeButton.displayName = 'MockThemeButton';
  return MockThemeButton;
});

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
