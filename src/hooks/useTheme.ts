'use client'

import { useCallback, useEffect, useState } from 'react'

const THEME_KEY = 'theme'

function readSavedTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark'
  return window.localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark'
}

/**
 * Shared light/dark theme state.
 *
 * Persists the choice under localStorage `theme` and toggles the
 * `light-theme` class on <html> (the global CSS hooks off it). Extracted from
 * TopHeader so the Settings page and any future UI can stay in sync.
 */
export function useTheme() {
  const [isLightMode, setIsLightMode] = useState<boolean>(() => readSavedTheme() === 'light')

  useEffect(() => {
    // Apply the saved theme to <html> on mount (the lazy initializer above
    // already set state; this only syncs the DOM class).
    if (readSavedTheme() === 'light') {
      document.documentElement.classList.add('light-theme')
    }
  }, [])

  const setTheme = useCallback((mode: 'light' | 'dark') => {
    const light = mode === 'light'
    setIsLightMode(light)
    window.localStorage.setItem(THEME_KEY, mode)
    document.documentElement.classList.toggle('light-theme', light)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(isLightMode ? 'dark' : 'light')
  }, [isLightMode, setTheme])

  return { isLightMode, setTheme, toggleTheme }
}
