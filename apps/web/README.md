# FinEngine Web — Dashboard Financeiro

Interface web moderna para o **FinEngine OSS**, construída com Next.js 15, Tailwind CSS e Recharts.

## Stack

- **Next.js 15** (App Router)
- **Tailwind CSS** — tema preto/branco/azul
- **Recharts** — gráficos animados
- **TypeScript**

## Executar localmente

```bash
pnpm dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

## Deploy no Vercel

### Opção 1 — Import direto do repositório

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Importe o repositório `OpenSource-FinanceBank`
3. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
4. Clique em **Deploy**

### Opção 2 — Via CLI

```bash
cd apps/web
npx vercel --prod
```

## Funcionalidades

- 📊 **Dashboard** com cards animados (receitas, despesas, saldo, poupança)
- 📈 **Gráfico mensal** — área com receitas vs despesas
- 📂 **Breakdown por categoria** — barras animadas
- 💡 **Insights automáticos** — alertas, avisos e pontos positivos
- 🔍 **Lista de transações** — com busca e paginação
- 🌑 **Dark theme** com efeito glassmorphism

## Variáveis de ambiente

Nenhuma variável é necessária para o ambiente de testes — os dados são gerados pelo `MockConnector`.
