import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import ThemeToggle from '../components/ThemeToggle'
import { ThemeProvider } from '../context/ThemeContext'

describe('ThemeToggle Component Integration', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders correctly and toggles the theme on click', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )

    // Verify button exists in document
    const button = screen.getByRole('button', { name: /toggle theme/i })
    expect(button).toBeInTheDocument()

    // Click to toggle to dark
    fireEvent.click(button)
    expect(localStorage.getItem('theme')).toBe('dark')

    // Click to toggle back to light
    fireEvent.click(button)
    expect(localStorage.getItem('theme')).toBe('light')
  })
})
