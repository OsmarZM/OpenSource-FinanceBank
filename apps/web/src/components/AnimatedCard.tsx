'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import clsx from 'clsx'

interface AnimatedCardProps {
  icon?: React.ReactNode
  title: string
  value: string | number
  subtitle?: string
  color?: 'green' | 'red' | 'blue' | 'yellow' | 'purple'
  delay?: number
  trend?: { value: number; isUp: boolean }
  onClick?: () => void
  className?: string
}

const colorMap = {
  green: {
    bg: 'from-green-500/10 to-green-500/5',
    border: 'border-green-500/20',
    text: 'text-green-400',
    glow: 'shadow-lg shadow-green-500/10',
  },
  red: {
    bg: 'from-red-500/10 to-red-500/5',
    border: 'border-red-500/20',
    text: 'text-red-400',
    glow: 'shadow-lg shadow-red-500/10',
  },
  blue: {
    bg: 'from-blue-500/10 to-blue-500/5',
    border: 'border-blue-500/20',
    text: 'text-blue-400',
    glow: 'shadow-lg shadow-blue-500/10',
  },
  yellow: {
    bg: 'from-yellow-500/10 to-yellow-500/5',
    border: 'border-yellow-500/20',
    text: 'text-yellow-400',
    glow: 'shadow-lg shadow-yellow-500/10',
  },
  purple: {
    bg: 'from-purple-500/10 to-purple-500/5',
    border: 'border-purple-500/20',
    text: 'text-purple-400',
    glow: 'shadow-lg shadow-purple-500/10',
  },
}

export default function AnimatedCard({
  icon,
  title,
  value,
  subtitle,
  color = 'blue',
  delay = 0,
  trend,
  onClick,
  className,
}: AnimatedCardProps) {
  const { ref, inView } = useInView({
    threshold: 0.2,
    triggerOnce: true,
  })

  const colorClass = colorMap[color]

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ delay, duration: 0.5, type: 'spring', stiffness: 100 }}
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={clsx(
        'relative p-4 sm:p-5 rounded-2xl border backdrop-blur-xl',
        'cursor-pointer group transition-all',
        'bg-gradient-to-br',
        colorClass.bg,
        colorClass.border,
        colorClass.glow,
        onClick && 'hover:border-opacity-100',
        className
      )}
    >
      {/* Animated Background Gradient */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100"
        animate={{ opacity: [0, 0.5, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        style={{
          background: `radial-gradient(circle at 50% 50%, ${
            color === 'green'
              ? 'rgba(34, 197, 94, 0.1)'
              : color === 'red'
                ? 'rgba(239, 68, 68, 0.1)'
                : color === 'blue'
                  ? 'rgba(59, 130, 246, 0.1)'
                  : 'rgba(234, 179, 8, 0.1)'
          }, transparent)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          {icon && (
            <motion.div
              animate={{ rotate: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, type: 'tween' }}
              className="text-2xl"
            >
              {icon}
            </motion.div>
          )}
          {trend && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={clsx(
                'text-xs font-bold px-2 py-1 rounded-lg',
                trend.isUp
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-red-500/20 text-red-400'
              )}
            >
              {trend.isUp ? '↑' : '↓'} {Math.abs(trend.value)}%
            </motion.div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm text-gray-500 font-medium mb-1">{title}</h3>

        {/* Value */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={clsx('text-xl sm:text-2xl font-bold break-all', colorClass.text)}
        >
          {value}
        </motion.p>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-xs text-gray-600 mt-2">{subtitle}</p>
        )}
      </div>

      {/* Border Glow Effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none"
        style={{
          border: `1px solid transparent`,
          backgroundImage: `linear-gradient(${
            color === 'green'
              ? '90deg, rgba(34, 197, 94, 0.5) 0%, rgba(34, 197, 94, 0) 100%'
              : color === 'red'
                ? '90deg, rgba(239, 68, 68, 0.5) 0%, rgba(239, 68, 68, 0) 100%'
                : color === 'blue'
                  ? '90deg, rgba(59, 130, 246, 0.5) 0%, rgba(59, 130, 246, 0) 100%'
                  : '90deg, rgba(234, 179, 8, 0.5) 0%, rgba(234, 179, 8, 0) 100%'
          })`,
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box',
        }}
        animate={{ opacity: [0, 0.5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.div>
  )
}
