
import { render, screen } from '@testing-library/react';
import FloatingControls from '../components/FloatingControls/FloatingControls';
import { ThemeProvider } from '../ThemeContext';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

// Mock the child components
jest.mock('../components/FloatingControls/BackToTop', () => () => <div data-testid="back-to-top" />);
jest.mock('../components/FloatingControls/ThemeButton', () => () => <div data-testid="theme-button" />);

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

const mockStore = configureStore([]);

describe('FloatingControls', () => {
  let store;

  beforeEach(() => {
    require('next/navigation').usePathname.mockReturnValue('/');
  });

  it('should render BackToTop and ThemeButton components', () => {
    store = mockStore({ bracket: { progress: 0 } });
    render(
      <Provider store={store}>
        <ThemeProvider>
          <FloatingControls />
        </ThemeProvider>
      </Provider>
    );
    expect(screen.getByTestId('back-to-top')).toBeInTheDocument();
    expect(screen.getByTestId('theme-button')).toBeInTheDocument();
  });

  describe('when on an artist page', () => {
    beforeEach(() => {
      require('next/navigation').usePathname.mockReturnValue('/artist/some-handle');
    });

    it('should render RoundCompleteConfirmation when progress is 1', () => {
      store = mockStore({ bracket: { progress: 1 } });
      render(
        <Provider store={store}>
          <ThemeProvider>
            <FloatingControls />
          </ThemeProvider>
        </Provider>
      );
      expect(screen.getByLabelText('Go to Next Round')).toBeInTheDocument();
    });

    it('should not render RoundCompleteConfirmation when progress is not 1', () => {
      store = mockStore({ bracket: { progress: 0 } });
      render(
        <Provider store={store}>
          <ThemeProvider>
            <FloatingControls />
          </ThemeProvider>
        </Provider>
      );
      expect(screen.queryByLabelText('Go to Next Round')).not.toBeInTheDocument();
    });
  });

  describe('when not on an artist page', () => {
    beforeEach(() => {
      require('next/navigation').usePathname.mockReturnValue('/');
    });

    it('should not render RoundCompleteConfirmation even when progress is 1', () => {
      store = mockStore({ bracket: { progress: 1 } });
      render(
        <Provider store={store}>
          <ThemeProvider>
            <FloatingControls />
          </ThemeProvider>
        </Provider>
      );
      expect(screen.queryByLabelText('Go to Next Round')).not.toBeInTheDocument();
    });
  });
});
