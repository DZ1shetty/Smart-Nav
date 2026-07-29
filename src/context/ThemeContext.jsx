import { createContext, useContext, useEffect, useState, useRef } from 'react'

const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
  const isPendingRef = useRef(false)
  const [theme, setTheme] = useState(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      return savedTheme
    }
    // Fallback to system preference
    if (
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      return 'dark'
    }
    return 'light'
  })

  useEffect(() => {
    const root = window.document.documentElement
    // Remove both classes to prevent conflicts
    root.classList.remove('light', 'dark')
    // Add the current theme class
    root.classList.add(theme)
    // Persist to localStorage
    localStorage.setItem('theme', theme)
  }, [theme])

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e) => {
      // Only auto-switch if the user hasn't explicitly set a preference in localStorage
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const toggleTheme = (e) => {
    if (isPendingRef.current) return

    const isTest =
      (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') ||
      (import.meta.env && import.meta.env.MODE === 'test')

    if (isTest || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'))
      return
    }

    if (!document.startViewTransition) {
      setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'))
      return
    }

    isPendingRef.current = true

    const x = e?.clientX ?? window.innerWidth / 2
    const y = e?.clientY ?? window.innerHeight / 2
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )

    const transition = document.startViewTransition(() => {
      setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'))
    })

    transition.ready.then(() => {
      const anim = document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 450,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          pseudoElement: '::view-transition-new(root)',
        }
      )

      anim.onfinish = () => {
        isPendingRef.current = false
      }
    })

    transition.finished.catch(() => {
      isPendingRef.current = false
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
