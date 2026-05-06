'use client'

import { useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import dynamic from 'next/dynamic'

// react-pluggy-connect accesses `window` — must be loaded client-side only
const PluggyConnect = dynamic(
  () => import('react-pluggy-connect').then((m) => m.PluggyConnect),
  { ssr: false },
)

interface Props {
  /** Called when a bank is successfully connected. Receives the Pluggy Item ID. */
  onSuccess: (itemId: string) => void
  /** Optional label override */
  label?: string
}

type ConnectStatus = 'idle' | 'loading' | 'open' | 'error'

export default function PluggyConnectButton({ onSuccess, label = '🔗 Conectar banco' }: Props) {
  const [status, setStatus] = useState<ConnectStatus>('idle')
  const [connectToken, setConnectToken] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const openConnect = useCallback(async () => {
    setStatus('loading')
    setErrorMsg(null)

    try {
      const res = await fetch('/api/connect-token', { method: 'POST' })
      const data: { accessToken?: string; error?: string } = await res.json()

      if (!res.ok || !data.accessToken) {
        throw new Error(data.error ?? 'Falha ao obter token de conexão')
      }

      setConnectToken(data.accessToken)
      setStatus('open')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erro desconhecido')
      setStatus('error')
    }
  }, [])

  const handleSuccess = useCallback(
    (itemData: { item: { id: string } }) => {
      setStatus('idle')
      setConnectToken(null)
      onSuccess(itemData.item.id)
    },
    [onSuccess],
  )

  const handleClose = useCallback(() => {
    setStatus('idle')
    setConnectToken(null)
  }, [])

  const handleError = useCallback((error: { message?: string }) => {
    console.error('[PluggyConnect] error:', error)
    setErrorMsg(error?.message ?? 'Conexão recusada')
    setStatus('error')
  }, [])

  return (
    <>
      <button
        onClick={openConnect}
        disabled={status === 'loading' || status === 'open'}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-300 text-sm font-medium hover:bg-blue-600/30 hover:border-blue-400/40 hover:text-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {status === 'loading' ? (
          <>
            <span className="w-3.5 h-3.5 border-2 border-blue-400/40 border-t-blue-400 rounded-full animate-spin" />
            Abrindo...
          </>
        ) : (
          label
        )}
      </button>

      {status === 'error' && errorMsg && (
        <p className="text-xs text-red-400 mt-1">{errorMsg}</p>
      )}

      {status === 'open' && connectToken && typeof document !== 'undefined' && createPortal(
        <PluggyConnect
          connectToken={connectToken}
          includeSandbox={true}
          onSuccess={handleSuccess}
          onError={handleError}
          onClose={handleClose}
        />,
        document.body,
      )}
    </>
  )
}
