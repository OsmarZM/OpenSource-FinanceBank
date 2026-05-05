'use client'

import { useState, useMemo } from 'react'
import type { Transaction } from '@/lib/types'
import { formatBRL, getCategoryLabel, getCategoryIcon } from '@/lib/format'

interface Props {
  transactions: Transaction[]
}

export default function TransactionList({ transactions }: Props) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const PER_PAGE = 15

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return transactions
      .filter(
        (tx) =>
          tx.description.toLowerCase().includes(q) ||
          (tx.category ?? '').toLowerCase().includes(q),
      )
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [transactions, search])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  function handleSearch(v: string) {
    setSearch(v)
    setPage(1)
  }

  return (
    <div className="glass-card p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-lg font-semibold text-white mb-1">Transações</h2>
          <p className="text-sm text-gray-500">
            {filtered.length} de {transactions.length} transações
          </p>
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Buscar transação..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-colors w-full sm:w-64"
          />
        </div>
      </div>

      <div className="overflow-x-auto -mx-1">
        <table className="w-full min-w-[520px]">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left py-2 px-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Data</th>
              <th className="text-left py-2 px-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Descrição</th>
              <th className="text-left py-2 px-2 text-xs font-medium text-gray-500 uppercase tracking-wide hidden sm:table-cell">Categoria</th>
              <th className="text-right py-2 px-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Valor</th>
            </tr>
          </thead>
          <tbody className="stagger-children">
            {paged.map((tx, i) => {
              const isCredit = tx.amount >= 0
              return (
                <tr
                  key={tx.id}
                  className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors fade-up"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <td className="py-3 px-2 text-xs text-gray-500 whitespace-nowrap font-mono">
                    {tx.date.slice(5).split('-').reverse().join('/')}
                  </td>
                  <td className="py-3 px-2">
                    <span className="text-sm text-gray-200 line-clamp-1">{tx.description}</span>
                  </td>
                  <td className="py-3 px-2 hidden sm:table-cell">
                    <span className="inline-flex items-center gap-1 text-xs bg-white/5 border border-white/10 rounded-full px-2 py-0.5 text-gray-400">
                      {getCategoryIcon(tx.category ?? 'other')}
                      {getCategoryLabel(tx.category ?? 'other')}
                    </span>
                  </td>
                  <td className={`py-3 px-2 text-right text-sm font-semibold tabular-nums whitespace-nowrap ${isCredit ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isCredit ? '+' : ''}
                    {formatBRL(tx.amount)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
          <p className="text-xs text-gray-600">
            Página {page} de {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-xs rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:bg-blue-600/20 hover:border-blue-500/30 hover:text-blue-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ← Anterior
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-xs rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:bg-blue-600/20 hover:border-blue-500/30 hover:text-blue-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Próxima →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
