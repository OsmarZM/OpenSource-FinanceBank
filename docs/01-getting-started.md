# 01 — Getting Started

> **Instale, execute e entenda o FinEngine OSS em menos de 10 minutos.**

**Navegação:** [← Índice](00-summary.md) | [Arquitetura →](02-architecture.md)

---

## Índice

- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Primeiro uso — Demo](#primeiro-uso--demo)
- [Importar CSV](#importar-csv)
- [Ativar IA (opcional)](#ativar-ia-opcional)
- [Configurar Supabase (opcional)](#configurar-supabase-opcional)
- [Próximos passos](#próximos-passos)

---

## Pré-requisitos

| Ferramenta | Versão mínima | Como instalar |
|---|---|---|
| Node.js | 20+ | [nodejs.org](https://nodejs.org) |
| pnpm | 10+ | `npm install -g pnpm` |
| Python | 3.11+ _(opcional, apenas para IA)_ | [python.org](https://python.org) |
| Docker | qualquer _(opcional)_ | [docker.com](https://docker.com) |

Verifique sua instalação:

```bash
node --version    # v20.x.x ou superior
pnpm --version    # 10.x.x ou superior
python --version  # 3.11.x (opcional)
```

---

## Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/OsmarZM/OpenSource-FinanceBank.git
cd OpenSource-FinanceBank

# 2. Instale todas as dependências do monorepo
pnpm install

# 3. Build de todos os pacotes (obrigatório na primeira vez)
pnpm build
```

> **Tempo estimado:** ~30s na primeira execução (download de deps + build)

---

## Primeiro uso — Demo

O modo demo usa dados financeiros simulados e **não requer nenhuma configuração**:

```bash
pnpm demo
```

Você verá uma análise completa com:
- Resumo financeiro (receitas, despesas, saldo, taxa de poupança)
- Breakdown por categoria com gráficos de barra
- Insights automáticos (poupança baixa, tendências, assinaturas)

### O que são os dados do demo?

O modo demo gera ~126 transações simuladas cobrindo 90 dias, com:
- Salários mensais + renda freelance
- Contas fixas (aluguel, utilidades, assinaturas)
- Supermercados, iFood, restaurantes
- Transporte, saúde, compras, lazer
- Investimentos (Tesouro Direto, CDB)
- **Padrão deliberado:** gastos com alimentação aumentam ~35% nos últimos 30 dias (para demonstrar a detecção de tendências)

Fonte: [packages/connector-mock/src/data.ts](../packages/connector-mock/src/data.ts)

---

## Importar CSV

### Formato esperado

```csv
date,description,amount,type,category
2024-01-05,Salário Empresa XYZ,8000.00,credit,income
2024-01-07,Aluguel,-2500.00,debit,housing
2024-01-12,Supermercado Carrefour,-287.50,debit,food
```

**Colunas obrigatórias** (nomes aceitos em PT e EN):

| Campo | Nomes aceitos |
|---|---|
| Data | `date`, `data`, `dt`, `fecha` |
| Descrição | `description`, `descricao`, `historico`, `memo`, `label` |
| Valor | `amount`, `valor`, `value`, `quantia` |

**Colunas opcionais:**
- `type` / `tipo`: `credit`/`debit` (inferido do sinal se ausente)
- `category` / `categoria`: categoriza automaticamente se ausente

**Formatos de valor aceitos:**
```
-1.234,56   (formato BR — vírgula decimal)
-1234.56    (formato US — ponto decimal)
-1,234.56   (US com separador de milhares)
R$ -250,00  (com símbolo de moeda)
```

### Como importar

```bash
# Modo interativo
node packages/cli/dist/index.js start
# Selecione: 📄 Importar CSV
# Informe: examples/sample.csv (ou seu arquivo)
```

### Arquivo de exemplo

```bash
# Veja o formato correto
cat examples/sample.csv
```

---

## Ativar IA (opcional) {#ia}

A análise com IA **requer Python** e um provider configurado.

### Passo 1: Instalar Python e uv

```bash
# Windows
winget install Python.Python.3.12
pip install uv

# macOS
brew install python@3.12 uv

# Linux
apt install python3.12 python3-pip
pip install uv
```

### Passo 2: Instalar dependências Python

```bash
cd services/agents
uv sync
cd ../..
```

### Passo 3: Configurar o provider

Crie um `.env` a partir do `.env.example`:

```bash
cp .env.example .env
```

Escolha um provider e configure:

**Gratuito (local) — Ollama:**
```env
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3
```
Instale o Ollama em [ollama.ai](https://ollama.ai) e baixe um modelo: `ollama pull llama3`

**AWS Bedrock (Claude):**
```env
LLM_PROVIDER=bedrock
LLM_MODEL=anthropic.claude-3-5-sonnet-20241022-v2:0
AWS_REGION=us-east-1
AWS_BEARER_TOKEN_BEDROCK=seu-token
```

**OpenAI:**
```env
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-...
```

> A análise sem IA (`LLM_PROVIDER=none`) continua funcionando normalmente com regras determinísticas.

---

## Configurar Supabase (opcional)

O Supabase adiciona persistência ao sistema — salve e consulte histórico de análises.

### 1. Criar projeto no Supabase

1. Acesse [app.supabase.com](https://app.supabase.com)
2. Crie um novo projeto
3. Vá em **SQL Editor** e execute todo o conteúdo de [`packages/database/migrations/001_initial.sql`](../packages/database/migrations/001_initial.sql)

### 2. Copiar credenciais

Em **Project Settings → API**:
- `URL` → `SUPABASE_URL`
- `anon public` → `SUPABASE_ANON_KEY`

### 3. Adicionar ao .env

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
```

Guia completo: [docs/07-database-supabase.md](07-database-supabase.md)

---

## Próximos passos

| Interesse | Documento |
|---|---|
| Entender a arquitetura | [02-architecture.md](02-architecture.md) |
| Adicionar meu banco/CSV customizado | [04-connectors.md](04-connectors.md) |
| Usar IA avançada | [06-ai-agents.md](06-ai-agents.md) |
| Ver todos os comandos | [09-cli-reference.md](09-cli-reference.md) |
| Rodar via Docker | [08-docker.md](08-docker.md) |
| Contribuir com o projeto | [11-contributing.md](11-contributing.md) |

---

**Navegação:** [← Índice](00-summary.md) | [Arquitetura →](02-architecture.md)
