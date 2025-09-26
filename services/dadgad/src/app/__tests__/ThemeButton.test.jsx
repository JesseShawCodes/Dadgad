import { render, screen } from '@testing-library/react';
import ThemeButton from '../components/FloatingControls/ThemeButton';
import { ThemeContext } from '../ThemeContext';

describe('Theme Button', () => {
  const renderWithTheme = (theme, toggleTheme = () => {}) => {
    return render(
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        <ThemeButton />
      </ThemeContext.Provider>
    );
  };

  it('should render the sun icon as active when the theme is light', () => {
    renderWithTheme('light');
    const sunIcon = screen.getByRole('button').querySelector('.sun-icon');
    const moonIcon = screen.getByRole('button').querySelector('.moon-icon');
    expect(sunIcon).toHaveClass('active');
    expect(moonIcon).not.toHaveClass('active');
  });

  it('should render the moon icon as active when the theme is dark', () => {
    renderWithTheme('dark');
    const sunIcon = screen.getByRole('button').querySelector('.sun-icon');
    const moonIcon = screen.getByRole('button').querySelector('.moon-icon');
    expect(moonIcon).toHaveClass('active');
    expect(sunIcon).not.toHaveClass('active');
  });
});
