'use client'

import { motion } from 'framer-motion'
import DesktopHeader from '@/components/layout/DesktopHeader'
import MobileNav from '@/components/layout/MobileNav'
import { useState } from 'react'
import { Zap, Plus, Send, TrendingDown, Eye, Share2 } from 'lucide-react'

const QUICK_ACTIONS = [
  {
    icon: Plus,
    label: 'Adicionar Despesa',
    color: 'red',
    description: 'Registrar uma despesa rápida',
  },
  {
    icon: TrendingDown,
    label: 'Transferência',
    color: 'blue',
    description: 'Enviar dinheiro',
  },
  {
    icon: Eye,
    label: 'Ver Extratos',
    color: 'purple',
    description: 'Consultar movimentação',
  },
  {
    icon: Share2,
    label: 'Compartilhar',
    color: 'green',
    description: 'Compartilhar dados',
  },
]

export default function QuickPage() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-950/10 to-black pb-20 md:pb-8">
      <DesktopHeader
        title="Ações Rápidas"
        subtitle="Operações Frequentes"
        rightContent={
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-colors text-sm"
          >
            <Zap size={16} />
            Personalizar
          </motion.button>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        <div className="space-y-8">
          {/* Quick Action Cards */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <h2 className="text-lg font-bold text-white">Operações Rápidas</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {QUICK_ACTIONS.map((action, idx) => {
                const Icon = action.icon
                const colorMap = {
                  red: 'from-red-500/10 to-red-500/5 border-red-500/20',
                  blue: 'from-blue-500/10 to-blue-500/5 border-blue-500/20',
                  purple: 'from-purple-500/10 to-purple-500/5 border-purple-500/20',
                  green: 'from-green-500/10 to-green-500/5 border-green-500/20',
                }

                return (
                  <motion.button
                    key={action.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => action.label === 'Adicionar Despesa' && setShowAddModal(true)}
                    className={`p-6 rounded-xl border bg-gradient-to-br text-left transition-all ${
                      colorMap[action.color as keyof typeof colorMap]
                    }`}
                  >
                    <motion.div
                      animate={{ rotate: [0, 10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`w-12 h-12 rounded-lg mb-4 flex items-center justify-center ${
                        action.color === 'red'
                          ? 'bg-red-500/20'
                          : action.color === 'blue'
                            ? 'bg-blue-500/20'
                            : action.color === 'purple'
                              ? 'bg-purple-500/20'
                              : 'bg-green-500/20'
                      }`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </motion.div>
                    <p className="font-bold text-white">{action.label}</p>
                    <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>

          {/* Recent Quick Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <h2 className="text-lg font-bold text-white">Histórico</h2>
            <div className="space-y-2">
              {[
                { action: 'Despesa registrada', value: '-R$ 45,90', time: '2h' },
                { action: 'Transferência enviada', value: '-R$ 500,00', time: '5h' },
                { action: 'Reembolso recebido', value: '+R$ 120,00', time: '1d' },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + idx * 0.05 }}
                  className="p-4 rounded-lg border border-white/10 bg-white/5 flex items-center justify-between hover:bg-white/10 transition-colors"
                >
                  <div>
                    <p className="text-white font-medium">{item.action}</p>
                    <p className="text-xs text-gray-600">{item.time} atrás</p>
                  </div>
                  <p className={item.value.startsWith('+') ? 'text-green-400' : 'text-red-400'}>
                    {item.value}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Add Expense Modal */}
          {showAddModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/50"
            >
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="w-full md:max-w-md p-6 rounded-2xl border border-white/10 bg-black/90 backdrop-blur-xl"
              >
                <h3 className="text-xl font-bold text-white mb-4">Adicionar Despesa</h3>
                <div className="space-y-4">
                  <input
                    type="number"
                    placeholder="Valor (R$)"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50"
                  />
                  <input
                    type="text"
                    placeholder="Descrição"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50"
                  />
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                    >
                      Cancelar
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 px-4 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30 transition-colors"
                    >
                      Adicionar
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
