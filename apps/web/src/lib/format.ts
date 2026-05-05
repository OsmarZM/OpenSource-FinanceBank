export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatMonth(key: string): string {
  const [year, month] = key.split('-')
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return `${months[parseInt(month, 10) - 1]}/${year?.slice(2)}`
}

export const CATEGORY_LABELS: Record<string, string> = {
  food: 'Alimentação',
  transport: 'Transporte',
  housing: 'Moradia',
  health: 'Saúde',
  education: 'Educação',
  entertainment: 'Lazer',
  shopping: 'Compras',
  income: 'Receita',
  investment: 'Investimento',
  transfer: 'Transferência',
  subscription: 'Assinaturas',
  utilities: 'Serviços',
  other: 'Outros',
}

export const CATEGORY_ICONS: Record<string, string> = {
  food: '🍔',
  transport: '🚗',
  housing: '🏠',
  health: '❤️',
  education: '📚',
  entertainment: '🎬',
  shopping: '🛍️',
  income: '💰',
  investment: '📈',
  transfer: '↔️',
  subscription: '📱',
  utilities: '⚡',
  other: '📦',
}

export function getCategoryLabel(cat: string): string {
  return CATEGORY_LABELS[cat] ?? cat
}

export function getCategoryIcon(cat: string): string {
  return CATEGORY_ICONS[cat] ?? '📦'
}
