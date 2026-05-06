'use client'

import { motion } from 'framer-motion'
import DesktopHeader from '@/components/layout/DesktopHeader'
import MobileNav from '@/components/layout/MobileNav'
import { useState } from 'react'
import {
  Bell,
  Moon,
  Lock,
  Palette,
  Database,
  HelpCircle,
  LogOut,
  ChevronRight,
} from 'lucide-react'

const SETTINGS_SECTIONS = [
  {
    title: 'Aparência',
    icon: Palette,
    items: [
      { label: 'Tema', value: 'Escuro', icon: Moon },
      { label: 'Cor Primária', value: 'Azul', icon: Palette },
    ],
  },
  {
    title: 'Notificações',
    icon: Bell,
    items: [
      { label: 'Alertas de Transações', value: 'Ativado', toggle: true },
      { label: 'Relatório Semanal', value: 'Ativado', toggle: true },
      { label: 'Alertas de Mercado', value: 'Desativado', toggle: true },
    ],
  },
  {
    title: 'Privacidade & Segurança',
    icon: Lock,
    items: [
      { label: 'Autenticação de Dois Fatores', value: 'Ativada', icon: Lock },
      { label: 'Biometria', value: 'Desativada', icon: Lock },
    ],
  },
  {
    title: 'Dados & Integração',
    icon: Database,
    items: [
      { label: 'Conectar Banco', value: 'Pluggy', icon: Database },
      { label: 'Exportar Dados', value: 'CSV, JSON', icon: Database },
      { label: 'Backup Automático', value: 'Ativado', icon: Database },
    ],
  },
]

export default function SettingsPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>('Aparência')
  const [notifications, setNotifications] = useState({
    transactions: true,
    weekly: true,
    market: false,
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-950/10 to-black pb-20 md:pb-8">
      <DesktopHeader
        title="Configurações"
        subtitle="Personalize sua experiência"
      />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        <div className="space-y-4">
          {/* User Profile */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-blue-500/5 flex items-center justify-between mb-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-2xl">
                👤
              </div>
              <div>
                <p className="font-bold text-white">Seu Perfil</p>
                <p className="text-xs text-gray-500">usuario@finengine.local</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors text-sm"
            >
              Editar
            </motion.button>
          </motion.div>

          {/* Settings Sections */}
          {SETTINGS_SECTIONS.map((section, sectionIdx) => {
            const Icon = section.icon
            const isExpanded = expandedSection === section.title

            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: sectionIdx * 0.1 }}
              >
                {/* Section Header */}
                <motion.button
                  onClick={() =>
                    setExpandedSection(isExpanded ? null : section.title)
                  }
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                  className="w-full p-4 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between text-left transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-blue-400" />
                    <p className="font-bold text-white">{section.title}</p>
                  </div>
                  <motion.div
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  </motion.div>
                </motion.button>

                {/* Expandable Items */}
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-2 space-y-2 ml-2"
                  >
                    {section.items.map((item, itemIdx) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: itemIdx * 0.05 }}
                        className="p-4 rounded-lg border border-white/10 bg-white/5 flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          {item.icon && (
                            <item.icon className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
                          )}
                          <p className="text-white font-medium">{item.label}</p>
                        </div>

                        {item.toggle ? (
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              if (item.label === 'Alertas de Transações') {
                                setNotifications((prev) => ({
                                  ...prev,
                                  transactions: !prev.transactions,
                                }))
                              } else if (item.label === 'Relatório Semanal') {
                                setNotifications((prev) => ({
                                  ...prev,
                                  weekly: !prev.weekly,
                                }))
                              } else if (item.label === 'Alertas de Mercado') {
                                setNotifications((prev) => ({
                                  ...prev,
                                  market: !prev.market,
                                }))
                              }
                            }}
                            className={`w-10 h-6 rounded-full transition-colors ${
                              (item.label === 'Alertas de Transações'
                                ? notifications.transactions
                                : item.label === 'Relatório Semanal'
                                  ? notifications.weekly
                                  : item.label === 'Alertas de Mercado'
                                    ? notifications.market
                                    : false)
                                ? 'bg-blue-500/50'
                                : 'bg-white/10'
                            }`}
                          >
                            <motion.div
                              layout
                              className="w-5 h-5 rounded-full bg-white"
                              initial={false}
                              animate={{
                                x: (item.label === 'Alertas de Transações'
                                  ? notifications.transactions
                                  : item.label === 'Relatório Semanal'
                                    ? notifications.weekly
                                    : item.label === 'Alertas de Mercado'
                                      ? notifications.market
                                      : false)
                                  ? 20
                                  : 2,
                              }}
                              transition={{ duration: 0.2 }}
                            />
                          </motion.button>
                        ) : (
                          <p className="text-xs text-gray-500 font-medium">{item.value}</p>
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            )
          })}

          {/* Help & Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-2"
          >
            <motion.button
              whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
              className="w-full p-4 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-blue-400" />
                <p className="font-bold text-white">Ajuda & Suporte</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </motion.button>

            {/* Sign Out Button */}
            <motion.button
              whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
              className="w-full p-4 rounded-xl border border-red-500/20 bg-red-500/5 flex items-center justify-between transition-colors hover:border-red-500/30"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5 text-red-400" />
                <p className="font-bold text-red-400">Sair</p>
              </div>
              <ChevronRight className="w-5 h-5 text-red-400/50" />
            </motion.button>
          </motion.div>

          {/* App Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center pt-4 border-t border-white/10"
          >
            <p className="text-xs text-gray-600 mb-2">FinEngine OSS v0.1.0</p>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ●
              </motion.span>
              <span>Sistema em tempo real</span>
            </div>
          </motion.div>
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
