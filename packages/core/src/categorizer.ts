import type { Category, Transaction } from '@fin-engine/types'

// ─── Category rules (order matters — first match wins) ──────────────────────

const RULES: Array<[RegExp, Category]> = [
  // Income
  [/sal[aá]rio|pagamento|folha|remunera[cç][aã]o|freelance|honor[aá]rio|servi[cç]o prestado/i, 'income'],

  // Investment
  [/tesouro|c\.?d\.?b|l\.?c\.?i|l\.?c\.?a|fundo.*invest|aplicac[aã]o|renda fixa|poupan[cç]a|a[cç][aõo][es]*|fii\b|etf\b/i, 'investment'],

  // Housing
  [/aluguel|condom[ií]nio|iptu|financiamento.*im[oó]vel|seguro.*resid/i, 'housing'],

  // Utilities
  [/energia|luz\b|enel|cemig|cpfl|light\b|[aá]gua\b|sabesp|saneamento|g[aá]s\b|internet|banda larga|fibra|claro\b|vivo\b|tim\b|oi\b|net\b|telefone/i, 'utilities'],

  // Subscriptions
  [/netflix|spotify|disney|amazon\s*prime|hbo|globoplay|paramount|deezer|youtube\s*premium|apple.*one|microsoft.*365/i, 'subscription'],

  // Health
  [/plano.*sa[uú]de|unimed|amil|sulam[eé]rica|hapvida|drog[ao]|farm[aá]cia|ultrafarma|drogasil|hospital|cl[ií]nica|m[eé]dico|dentista|academia|smartfit|crossfit|bluefit|bodytech|personal/i, 'health'],

  // Education
  [/escola|faculdade|universidade|curso|udemy|alura|duolingo|livro|livraria|mensalidade.*escola/i, 'education'],

  // Food — delivery first (more specific)
  [/ifood|rappi|uber\s*eats|aiqfome|james\s*delivery/i, 'food'],

  // Food — supermarkets
  [/supermercado|mercado\b|carrefour|extra\b|p[aã]o\s*de\s*a[cç][uú]car|hipermercado|atacad[aã]o|assai|asa\s*super|walmart|big\b|comper/i, 'food'],

  // Food — restaurants
  [/restaurante|lanchonete|pizzaria|hambur|subway|mcdonalds|burger|sushi|churrasco|padaria|caf[eé]\b|bar\b.*restaur|bistr[oô]/i, 'food'],

  // Transport
  [/uber\b|99\s*taxi|cabify|taxi\b|metr[oô]|[oô]nibus|bilhete|passagem|terminal\b|posto\b|gasolina|combust[ií]vel|shell\b|ipiranga\b|petrobras\b|br\s*distribui[cç]/i, 'transport'],

  // Shopping
  [/shopping|roupa|vestu[aá]rio|cal[cç]ado|renner|riachuelo|c&a\b|marisa|hering|americanas|magazineluiza|magazine\s*luiza|casas\s*bahia|leroy|decathlon|amazon\b/i, 'shopping'],

  // Entertainment
  [/cinema|teatro|show\b|ingresso|parque|viagem|hotel|airbnb|booking|trivago|passagem\s*a[eé]rea|voo\b/i, 'entertainment'],

  // Transfer
  [/transfer[eê]ncia|ted\b|doc\b|pix\b/i, 'transfer'],
]

/**
 * Infers a category for a transaction based on its description.
 * Returns 'other' if no rule matches.
 */
export function categorize(description: string): Category {
  for (const [pattern, category] of RULES) {
    if (pattern.test(description)) return category
  }
  return 'other'
}
