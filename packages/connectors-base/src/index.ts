import type { Connector, Transaction } from '@fin-engine/types'

export type { Connector, Transaction }

/**
 * Abstract base class for all connectors.
 * Subclasses must implement `name` and `getTransactions()`.
 * Override `connect()` if authentication or setup is needed.
 */
export abstract class BaseConnector implements Connector {
  abstract readonly name: string

  async connect(): Promise<void> {
    // No-op by default — override for auth/setup flows
  }

  abstract getTransactions(): Promise<Transaction[]>
}
