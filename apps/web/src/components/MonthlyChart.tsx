'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { MonthlyData } from '@/lib/types'
import { formatBRL, formatMonth } from '@/lib/format'

interface Props {
  data: MonthlyData[]
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card border border-blue-500/20 p-3 min-w-[160px]">
      <p className="text-sm text-gray-400 mb-2 font-medium">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-4 text-sm">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
            <span className="text-gray-400">{p.name}</span>
          </span>
          <span className="font-semibold tabular-nums" style={{ color: p.color }}>
            {formatBRL(p.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function MonthlyChart({ data }: Props) {
  const chartData = data.map((m) => ({
    month: formatMonth(m.month),
    Receitas: m.income,
    Despesas: m.expenses,
    Saldo: m.balance,
  }))

  return (
    <div className="glass-card p-6">
      <h2 className="text-lg font-semibold text-white mb-1">Evolução Mensal</h2>
      <p className="text-sm text-gray-500 mb-5">Receitas e despesas por mês</p>
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradExpenses" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradBalance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="month"
            tick={{ fill: '#6B7280', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#6B7280', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) =>
              v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v}`
            }
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '16px', color: '#9CA3AF', fontSize: '13px' }}
          />
          <Area
            type="monotone"
            dataKey="Receitas"
            stroke="#22C55E"
            strokeWidth={2}
            fill="url(#gradIncome)"
            dot={{ fill: '#22C55E', r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#22C55E', strokeWidth: 0 }}
          />
          <Area
            type="monotone"
            dataKey="Despesas"
            stroke="#EF4444"
            strokeWidth={2}
            fill="url(#gradExpenses)"
            dot={{ fill: '#EF4444', r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#EF4444', strokeWidth: 0 }}
          />
          <Area
            type="monotone"
            dataKey="Saldo"
            stroke="#3B82F6"
            strokeWidth={2}
            fill="url(#gradBalance)"
            dot={{ fill: '#3B82F6', r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#3B82F6', strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
