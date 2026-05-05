import { BaseConnector } from '@fin-engine/connectors-base'
import type { Transaction } from '@fin-engine/types'
import { generateMockTransactions } from './data'

export { generateMockTransactions }

export class MockConnector extends BaseConnector {
  readonly name = 'mock'

  async getTransactions(): Promise<Transaction[]> {
    return generateMockTransactions()
  }
}
