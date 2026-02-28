import { act, render, screen } from '@testing-library/react';
import MaintenancePageContent from '../components/MaintenancePageContent';

describe('MaintenancePageContent', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('renders maintenance copy', () => {
    render(<MaintenancePageContent />);

    expect(screen.getByRole('heading', { name: /under maintenance/i })).toBeInTheDocument();
    expect(
      screen.getByText(/we are performing some essential upgrades to improve your experience/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/thank you for your patience and understanding/i)).toBeInTheDocument();
  });

  it('schedules and clears the refresh timeout', () => {
    const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

    const { unmount } = render(<MaintenancePageContent />);

    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 1000);
    const scheduledTimeoutId = setTimeoutSpy.mock.results[0]?.value;

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalledWith(scheduledTimeoutId);
  });

  it('handles elapsed maintenance windows after timer tick', () => {
    render(<MaintenancePageContent />);

    act(() => {
      jest.setSystemTime(new Date('2026-01-04T00:00:01.000Z'));
      jest.advanceTimersByTime(1000);
    });

    // Component remains stable after the countdown expires.
    expect(screen.getByRole('heading', { name: /under maintenance/i })).toBeInTheDocument();
  });
});
