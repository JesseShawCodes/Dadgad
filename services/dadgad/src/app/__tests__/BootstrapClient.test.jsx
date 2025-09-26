
import React from 'react';
import { render } from '@testing-library/react';
import BootstrapClient from '../components/BootstrapClient';

describe('BootstrapClient', () => {
  it('should render without throwing an error', () => {
    // Spy on console.error to check for any errors thrown during rendering
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Render the component
    render(<BootstrapClient />);

    // Assert that console.error was not called
    expect(consoleErrorSpy).not.toHaveBeenCalled();

    // Restore the original console.error function
    consoleErrorSpy.mockRestore();
  });
});
