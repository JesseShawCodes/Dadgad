import { render, screen } from '@testing-library/react';
import WarningMessage from '../components/WarningMessage';

describe('WarningMessage', () => {
  it('should render the default message if no message is provided', () => {
    render(<WarningMessage />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('We are actively working to improve this experience, but some features may not work as expected. Thank you for your patience!');
  });

  it('should render the provided message', () => {
    const message = 'This is a test warning message.';
    render(<WarningMessage message={message} />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(message);
  });

  it('should have the "warning" class by default', () => {
    render(<WarningMessage />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('alert-warning');
  });

  it('should have the specified class based on the type prop', () => {
    render(<WarningMessage type="danger" />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('alert-danger');
  });
});
