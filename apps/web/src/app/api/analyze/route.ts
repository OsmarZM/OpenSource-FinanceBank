import { NextResponse } from 'next/server'
import { generateMockTransactions } from '@/lib/mock-data'
import { analyze } from '@/lib/engine'

export async function GET() {
  const transactions = generateMockTransactions()
  const result = analyze(transactions)
  return NextResponse.json(result)
}
