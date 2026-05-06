'use client'

import { useState, useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'
import { toggleTheme, getTheme } from '@/lib/theme'
import type { Theme } from '@/lib/theme'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setTheme(getTheme())
  }, [])

  if (!mounted) return null

  const handleToggle = () => {
    const newTheme = toggleTheme()
    setTheme(newTheme)
  }

  return (
    <button
      onClick={handleToggle}
      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
      title={`Alternar para tema ${theme === 'dark' ? 'claro' : 'escuro'}`}
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-yellow-400" />
      ) : (
        <Moon className="w-5 h-5 text-gray-600" />
      )}
    </button>
  )
}
