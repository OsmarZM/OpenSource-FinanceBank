'use client'

import { motion } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  Zap,
  Settings,
  Home,
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import clsx from 'clsx'

interface NavItem {
  id: string
  icon: React.ReactNode
  label: string
  href: string
  badge?: number
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', icon: <Home size={24} />, label: 'Início', href: '/' },
  { id: 'analytics', icon: <BarChart3 size={24} />, label: 'Análise', href: '/analytics' },
  { id: 'market', icon: <TrendingUp size={24} />, label: 'Mercado', href: '/market' },
  { id: 'quick', icon: <Zap size={24} />, label: 'Ação', href: '/quick' },
  { id: 'settings', icon: <Settings size={24} />, label: 'Config', href: '/settings' },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
    >
      <div className="bg-black/95 backdrop-blur-2xl border-t border-white/10">
        <div className="grid grid-cols-5 gap-1 px-2 py-2">
          {NAV_ITEMS.map((item, idx) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.id} href={item.href}>
                <motion.div
                  initial={false}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={clsx(
                    'relative flex flex-col items-center justify-center py-3 px-2 rounded-xl transition-colors',
                    isActive
                      ? 'text-blue-400'
                      : 'text-gray-500 hover:text-gray-300'
                  )}
                >
                  <motion.div
                    animate={{
                      scale: isActive ? 1.1 : 1,
                      filter: isActive ? 'drop-shadow(0 0 8px rgba(96, 165, 250, 0.5))' : 'none',
                    }}
                    transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                  >
                    {item.icon}
                  </motion.div>
                  <span className="text-xs mt-1 font-medium">{item.label}</span>

                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-0 rounded-xl bg-blue-500/10 -z-10"
                      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    />
                  )}

                  {item.badge && (
                    <motion.span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {item.badge}
                    </motion.span>
                  )}
                </motion.div>
              </Link>
            )
          })}
        </div>
      </div>
    </motion.nav>
  )
}
