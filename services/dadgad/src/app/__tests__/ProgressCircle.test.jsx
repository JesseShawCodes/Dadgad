import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import ProgressCircle from '../components/ProgressCircle';

describe('ProgressCircle', () => {
  const mockStore = configureStore([]);

  it('renders with 0% progress', () => {
    const store = mockStore({
      bracket: { progress: 0 },
    });
    render(
      <Provider store={store}>
        <ProgressCircle />
      </Provider>
    );
    expect(screen.getByTestId('progress-circle-label')).toHaveTextContent('0%');
  });

  it('renders with 50% progress', () => {
    const store = mockStore({
      bracket: { progress: 0.5 },
    });
    render(
      <Provider store={store}>
        <ProgressCircle />
      </Provider>
    );
    expect(screen.getByTestId('progress-circle-label')).toHaveTextContent('50%');
  });

  it('renders with 100% progress', () => {
    const store = mockStore({
      bracket: { progress: 1 },
    });
    render(
      <Provider store={store}>
        <ProgressCircle />
      </Provider>
    );
    expect(screen.getByTestId('progress-circle-label')).toHaveTextContent('100%');
  });

  it('renders with 33% progress', () => {
    const store = mockStore({
      bracket: { progress: 0.333 },
    });
    render(
      <Provider store={store}>
        <ProgressCircle />
      </Provider>
    );
    expect(screen.getByTestId('progress-circle-label')).toHaveTextContent('33%');
  });
});
