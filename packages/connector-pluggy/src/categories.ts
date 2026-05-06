import type { Category } from '@fin-engine/types'

/**
 * Maps Pluggy's category strings to FinEngine Category enum values.
 * Reference: https://docs.pluggy.ai/docs/transaction-categories
 */
const PLUGGY_CATEGORY_MAP: Record<string, Category> = {
  // Income
  'Income': 'income',
  'Salary': 'income',
  'Investment Income': 'income',
  'Other Income': 'income',
  'Transfer In': 'transfer',

  // Housing
  'Housing': 'housing',
  'Rent': 'housing',
  'Mortgage': 'housing',
  'Home Improvement': 'housing',

  // Utilities
  'Utilities': 'utilities',
  'Phone': 'utilities',
  'Internet': 'utilities',
  'Cable': 'utilities',
  'Electricity': 'utilities',
  'Water': 'utilities',
  'Gas': 'utilities',

  // Food
  'Food and Drink': 'food',
  'Restaurants': 'food',
  'Fast Food': 'food',
  'Groceries': 'food',
  'Coffee Shop': 'food',
  'Delivery': 'food',

  // Transport
  'Transportation': 'transport',
  'Gas Station': 'transport',
  'Parking': 'transport',
  'Taxi': 'transport',
  'Ride Share': 'transport',
  'Public Transportation': 'transport',
  'Auto Insurance': 'transport',

  // Health
  'Health': 'health',
  'Medical': 'health',
  'Pharmacy': 'health',
  'Dentist': 'health',
  'Gym': 'health',
  'Health Insurance': 'health',

  // Education
  'Education': 'education',
  'Tuition': 'education',
  'Books': 'education',
  'Online Courses': 'education',

  // Entertainment
  'Entertainment': 'entertainment',
  'Movies': 'entertainment',
  'Music': 'entertainment',
  'Games': 'entertainment',
  'Travel': 'entertainment',
  'Hotel': 'entertainment',
  'Events': 'entertainment',

  // Shopping
  'Shopping': 'shopping',
  'Clothing': 'shopping',
  'Electronics': 'shopping',
  'Home': 'shopping',
  'Online Shopping': 'shopping',

  // Subscriptions
  'Subscription': 'subscription',
  'Streaming': 'subscription',
  'Software': 'subscription',

  // Investment
  'Investment': 'investment',
  'Savings': 'investment',
  'Securities': 'investment',
  'Crypto': 'investment',

  // Transfer
  'Transfer': 'transfer',
  'Transfer Out': 'transfer',
  'Payment': 'transfer',
  'Credit Card Payment': 'transfer',
  'Bank Fee': 'other',
  'ATM': 'transfer',
}

/**
 * Converts a Pluggy category string to the FinEngine Category enum.
 * Falls back to 'other' for unmapped values.
 */
export function pluggyToCategory(pluggyCategory: string | null | undefined): Category {
  if (!pluggyCategory) return 'other'
  return PLUGGY_CATEGORY_MAP[pluggyCategory] ?? 'other'
}
