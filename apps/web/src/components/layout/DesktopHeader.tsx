'use client'

import { motion } from 'framer-motion'
import { formatBRL } from '@/lib/format'
import ThemeToggle from '@/components/ThemeToggle'

interface DesktopHeaderProps {
  title?: string
  subtitle?: string
  dataSource?: 'mock' | 'pluggy'
  transactionCount?: number
  period?: { from: string; to: string }
  rightContent?: React.ReactNode
}

export default function DesktopHeader({
  title = 'Dashboard',
  subtitle = 'Análise Financeira',
  dataSource = 'mock',
  transactionCount,
  period,
  rightContent,
}: DesktopHeaderProps) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo + Title */}
        <div className="flex-1">
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ x: 2 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-lg font-bold shadow-lg shadow-blue-500/20">
              💰
            </div>
            <div>
              <h1 className="font-bold text-white text-lg tracking-tight">{title}</h1>
              <p className="text-xs text-gray-500">{subtitle}</p>
            </div>
          </motion.div>
        </div>

        {/* Center Info */}
        {period && transactionCount !== undefined && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="hidden lg:flex items-center gap-6 text-sm text-gray-400"
          >
            <div>
              <span className="text-gray-500">Período:</span>
              <span className="ml-2 text-white font-medium">
                {period.from} — {period.to}
              </span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div>
              <span className="text-gray-500">Transações:</span>
              <span className="ml-2 text-white font-medium">{transactionCount}</span>
            </div>
          </motion.div>
        )}

        {/* Right Actions */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex-1 flex justify-end items-center gap-3"
        >
          <ThemeToggle />
          {rightContent}
        </motion.div>
      </div>
    </motion.header>
  )
}
