import { NextRequest, NextResponse } from 'next/server'

const OPENBB_URL = process.env['OPENBB_URL'] || 'http://localhost:3004'

interface OpenBBResponse {
  data?: Array<{
    symbol?: string
    close?: number
    [key: string]: unknown
  }>
  [key: string]: unknown
}

async function fetchOpenBB(endpoint: string) {
  try {
    const res = await fetch(`${OPENBB_URL}${endpoint}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

interface MarketDataItem {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume?: string
  high?: number
  low?: number
}

export async function GET(req: NextRequest) {
  try {
    // Tentar buscar dados reais do OpenBB primeiro
    const openbbEndpoint = process.env['OPENBB_URL'] || 'http://localhost:3004'
    let openbbData = null
    
    try {
      const response = await fetch(`${openbbEndpoint}/indices`, {
        signal: AbortSignal.timeout(3000),
      })
      if (response.ok) {
        openbbData = await response.json()
      }
    } catch (error) {
      console.log('OpenBB not available, using mock data')
    }

    // Dados mockados (fallback e para desenvolvimento)
    const mockIndices: MarketDataItem[] = [
      {
        symbol: 'IBOV',
        name: 'Ibovespa',
        price: 136200,
        change: 1200,
        changePercent: 0.89,
        high: 136500,
        low: 135800,
      },
      {
        symbol: 'SP500',
        name: 'S&P 500',
        price: 5432,
        change: -45,
        changePercent: -0.82,
        high: 5485,
        low: 5420,
      },
      {
        symbol: 'NASDAQ',
        name: 'NASDAQ',
        price: 17250,
        change: 125,
        changePercent: 0.73,
        high: 17300,
        low: 17100,
      },
      {
        symbol: 'EURO',
        name: 'EUR/USD',
        price: 1.0875,
        change: 0.0045,
        changePercent: 0.41,
        high: 1.0920,
        low: 1.0830,
      },
    ]

    const mockCommodities: MarketDataItem[] = [
      {
        symbol: 'USDBRL',
        name: 'USD/BRL',
        price: 4.95,
        change: -0.08,
        changePercent: -1.59,
        high: 5.03,
        low: 4.93,
      },
      {
        symbol: 'CRUDE',
        name: 'Petróleo (WTI)',
        price: 78.45,
        change: 1.25,
        changePercent: 1.62,
        high: 79.50,
        low: 77.80,
      },
      {
        symbol: 'GOLD',
        name: 'Ouro',
        price: 2380,
        change: 35,
        changePercent: 1.49,
        high: 2390,
        low: 2360,
      },
      {
        symbol: 'BTC',
        name: 'Bitcoin',
        price: 64250,
        change: 1500,
        changePercent: 2.38,
        high: 65200,
        low: 63100,
      },
    ]

    return NextResponse.json({
      indices: mockIndices,
      commodities: mockCommodities,
      crypto: [
        {
          symbol: 'ETH',
          name: 'Ethereum',
          price: 3450,
          change: 95,
          changePercent: 2.83,
          high: 3500,
          low: 3380,
        },
      ],
      timestamp: new Date().toISOString(),
      source: openbbData ? 'OpenBB' : 'Mock Data',
    })
  } catch (error) {
    console.error('Market API error:', error)
    return NextResponse.json(
      { error: 'Falha ao carregar dados de mercado' },
      { status: 500 }
    )
  }
}
