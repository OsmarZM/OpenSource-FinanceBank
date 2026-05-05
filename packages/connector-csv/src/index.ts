import { readFile } from 'node:fs/promises'
import { parse } from 'csv-parse/sync'
import { BaseConnector } from '@fin-engine/connectors-base'
import type { Transaction, Category } from '@fin-engine/types'

// Supported column name variants (case-insensitive)
const DATE_COLS = ['date', 'data', 'dt', 'fecha']
const DESC_COLS = ['description', 'descricao', 'descrição', 'historico', 'histórico', 'memo', 'label']
const AMOUNT_COLS = ['amount', 'valor', 'value', 'quantia', 'importe']
const TYPE_COLS = ['type', 'tipo', 'direction']
const CATEGORY_COLS = ['category', 'categoria', 'cat']

type RawRow = Record<string, string>

function findCol(headers: string[], candidates: string[]): string | undefined {
  return headers.find((h) => candidates.includes(h.toLowerCase().trim()))
}

function parseAmount(raw: string): number {
  // Handles: "1.234,56" (BR) → 1234.56 | "1,234.56" (US) → 1234.56 | "-250" → -250
  const cleaned = raw
    .replace(/\s/g, '')
    .replace(/[R$]/g, '')
    .replace(/\.(?=\d{3}[,])/g, '') // remove thousands dot (BR format)
    .replace(',', '.')               // decimal comma → dot
  const n = parseFloat(cleaned)
  return isNaN(n) ? 0 : n
}

function inferType(amount: number, raw?: string): 'credit' | 'debit' {
  if (raw) {
    const v = raw.toLowerCase().trim()
    if (['credit', 'credito', 'crédito', 'entrada', 'c', '+'].includes(v)) return 'credit'
    if (['debit', 'debito', 'débito', 'saida', 'saída', 'd', '-'].includes(v)) return 'debit'
  }
  return amount >= 0 ? 'credit' : 'debit'
}

/**
 * Reads a CSV file and returns normalized transactions.
 *
 * Supported column names (case-insensitive):
 *   date       → date | data | dt | fecha
 *   description → description | descricao | historico | memo | label
 *   amount     → amount | valor | value | quantia
 *   type       → type | tipo | direction   (optional)
 *   category   → category | categoria | cat  (optional)
 *
 * Amount sign convention: negative = expense, positive = income.
 * Accepts both BR format (1.234,56) and US format (1,234.56).
 */
export class CsvConnector extends BaseConnector {
  readonly name = 'csv'

  constructor(private readonly filePath: string) {
    super()
  }

  async getTransactions(): Promise<Transaction[]> {
    const content = await readFile(this.filePath, 'utf-8')

    const rows: RawRow[] = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true,
    }) as RawRow[]

    if (rows.length === 0) return []

    const headers = Object.keys(rows[0])
    const dateCol = findCol(headers, DATE_COLS)
    const descCol = findCol(headers, DESC_COLS)
    const amountCol = findCol(headers, AMOUNT_COLS)
    const typeCol = findCol(headers, TYPE_COLS)
    const categoryCol = findCol(headers, CATEGORY_COLS)

    if (!dateCol || !descCol || !amountCol) {
      throw new Error(
        `CSV missing required columns. Expected: date, description, amount.\n` +
        `Found: ${headers.join(', ')}\n` +
        `See examples/sample.csv for the expected format.`,
      )
    }

    return rows
      .map((row, idx): Transaction => {
        const amount = parseAmount(row[amountCol] ?? '0')
        const rawType = typeCol ? row[typeCol] : undefined
        const category = categoryCol ? (row[categoryCol] as Category | undefined) : undefined

        return {
          id: `csv-${String(idx + 1).padStart(4, '0')}`,
          date: row[dateCol] ?? '',
          description: row[descCol] ?? '',
          amount,
          type: inferType(amount, rawType),
          category: category || undefined,
        }
      })
      .filter((t) => t.date && t.description)
      .sort((a, b) => a.date.localeCompare(b.date))
  }
}
