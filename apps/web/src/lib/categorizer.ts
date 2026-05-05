import type { Category, Transaction } from './types'

const RULES: Array<[RegExp, Category]> = [
  [/sal[aá]rio|pagamento|folha|remunera[cç][aã]o|freelance|honor[aá]rio|servi[cç]o prestado/i, 'income'],
  [/tesouro|c\.?d\.?b|l\.?c\.?i|l\.?c\.?a|fundo.*invest|aplicac[aã]o|renda fixa|poupan[cç]a|a[cç][aõo][es]*|fii\b|etf\b/i, 'investment'],
  [/aluguel|condom[ií]nio|iptu|financiamento.*im[oó]vel|seguro.*resid/i, 'housing'],
  [/energia|luz\b|enel|cemig|cpfl|light\b|[aá]gua\b|sabesp|saneamento|g[aá]s\b|internet|banda larga|fibra|claro\b|vivo\b|tim\b|oi\b|net\b|telefone/i, 'utilities'],
  [/netflix|spotify|disney|amazon\s*prime|hbo|globoplay|paramount|deezer|youtube\s*premium|apple.*one|microsoft.*365/i, 'subscription'],
  [/plano.*sa[uú]de|unimed|amil|sulam[eé]rica|hapvida|drog[ao]|farm[aá]cia|ultrafarma|drogasil|hospital|cl[ií]nica|m[eé]dico|dentista|academia|smartfit|crossfit|bluefit|bodytech|personal/i, 'health'],
  [/escola|faculdade|universidade|curso|udemy|alura|duolingo|livro|livraria|mensalidade.*escola/i, 'education'],
  [/ifood|rappi|uber\s*eats|aiqfome|james\s*delivery/i, 'food'],
  [/supermercado|mercado\b|carrefour|extra\b|p[aã]o\s*de\s*a[cç][uú]car|hipermercado|atacad[aã]o|assai|asa\s*super|walmart|big\b|comper/i, 'food'],
  [/restaurante|lanchonete|pizzaria|hambur|subway|mcdonalds|burger|sushi|churrasco|padaria|caf[eé]\b|bar\b.*restaur|bistr[oô]/i, 'food'],
  [/uber\b|99\s*taxi|cabify|taxi\b|metr[oô]|[oô]nibus|bilhete|passagem|terminal\b|posto\b|gasolina|combust[ií]vel|shell\b|ipiranga\b|petrobras\b|br\s*distribui[cç]/i, 'transport'],
  [/shopping|roupa|vestu[aá]rio|cal[cç]ado|renner|riachuelo|c&a\b|marisa|hering|americanas|magazineluiza|magazine\s*luiza|casas\s*bahia|leroy|decathlon|amazon\b/i, 'shopping'],
  [/cinema|teatro|show\b|ingresso|parque|viagem|hotel|airbnb|booking|trivago|passagem\s*a[eé]rea|voo\b/i, 'entertainment'],
  [/transfer[eê]ncia|ted\b|doc\b|pix\b/i, 'transfer'],
]

export function categorize(description: string): Category {
  for (const [pattern, category] of RULES) {
    if (pattern.test(description)) return category
  }
  return 'other'
}
