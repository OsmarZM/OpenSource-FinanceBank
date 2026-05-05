# 11 — Contribuindo

> **Guia detalhado para contribuir com o FinEngine OSS.**

**Navegação:** [← Customização](10-customization.md) | [Índice →](00-summary.md)

---

## Índice

- [Por onde começar?](#por-onde-começar)
- [Setup do ambiente de desenvolvimento](#setup-do-ambiente-de-desenvolvimento)
- [Estrutura do monorepo](#estrutura-do-monorepo)
- [Fluxo de trabalho](#fluxo-de-trabalho)
- [Executando testes](#executando-testes)
- [Padrões de código](#padrões-de-código)
- [Checklist do PR](#checklist-do-pr)
- [Tipos de contribuição](#tipos-de-contribuição)

---

## Por onde começar?

### Boas issues para começar

Procure issues com as tags:
- `good first issue` — para iniciantes
- `help wanted` — precisamos de ajuda
- `documentation` — apenas docs, sem código

### Ideias de contribuição

- 🔌 **Novo connector**: Nubank, Inter, Bradesco, Santander, qualquer banco com API/CSV
- 🤖 **Novo provider LLM**: qualquer API que você use ou conheça
- 🌍 **Internacionalização**: suporte a bancos de outros países
- 📖 **Documentação**: exemplos, tutoriais, tradução
- 🧪 **Testes**: aumentar cobertura dos packages existentes
- 🐛 **Bugs**: corrija algo que você encontrou

---

## Setup do ambiente de desenvolvimento

### 1. Fork e clone

```bash
# Fork pelo GitHub: https://github.com/OsmarZM/OpenSource-FinanceBank/fork

git clone https://github.com/SEU_USUARIO/OpenSource-FinanceBank.git
cd OpenSource-FinanceBank
git remote add upstream https://github.com/OsmarZM/OpenSource-FinanceBank.git
```

### 2. Instalar ferramentas

```bash
# Node.js 20+ em https://nodejs.org
# pnpm
npm install -g pnpm

# Python 3.11+ (apenas para trabalhar com services/agents)
# uv (gerenciador de ambientes Python)
pip install uv
```

### 3. Instalar dependências

```bash
pnpm install

# Para Python (apenas se for trabalhar com services/agents):
cd services/agents
uv sync
cd ../..
```

### 4. Build inicial

```bash
pnpm build
```

### 5. Verificar que funciona

```bash
pnpm demo
```

Se você vir a análise financeira no terminal, o ambiente está pronto.

### 6. Modo watch (desenvolvimento ativo)

```bash
# Rebuild automático ao salvar
pnpm dev
# ou em um package específico:
pnpm --filter @fin-engine/core run dev
```

---

## Estrutura do monorepo

```
fin-engine/
├── packages/           TypeScript packages
│   ├── types/          Tipos compartilhados — fonte da verdade
│   ├── connectors-base/ Interface abstrata
│   ├── connector-mock/ Dados simulados
│   ├── connector-csv/  Parser CSV
│   ├── core/           Engine principal
│   ├── database/       Cliente Supabase
│   └── cli/            Interface terminal
│
├── services/           Serviços Python
│   └── agents/         Sidecar LLM
│
├── examples/           Arquivos de exemplo
├── docs/               Documentação
└── apps/               Aplicações demo
```

### Hierarquia de dependências

`types` ← `connectors-base` ← `connector-*` ← `core` ← `cli`

Nunca crie dependências circulares. Se precisar que `core` use algo de `cli`, extraia para `types` ou um novo package.

---

## Fluxo de trabalho

```bash
# 1. Sincronize com o upstream
git fetch upstream
git checkout main
git merge upstream/main

# 2. Crie uma branch descritiva
git checkout -b feature/connector-nubank
# ou:
git checkout -b fix/csv-brl-format
# ou:
git checkout -b docs/add-connector-guide

# 3. Faça suas mudanças
# (edite, crie, delete arquivos)

# 4. Teste
pnpm build
pnpm test
pnpm lint

# 5. Commit com convenção
git add .
git commit -m "feat(connector-csv): support BRL currency format with R$ prefix"

# 6. Push
git push origin feature/connector-nubank

# 7. Abra o Pull Request no GitHub
```

---

## Executando testes

```bash
# Todos os testes
pnpm test

# Package específico
pnpm --filter @fin-engine/core run test
pnpm --filter @fin-engine/connector-csv run test

# Modo watch
pnpm --filter @fin-engine/core run test -- --watch

# Com coverage
pnpm --filter @fin-engine/core run test -- --coverage
```

### Escrever testes

Os testes usam [Vitest](https://vitest.dev):

```typescript
// packages/core/src/categorizer.test.ts
import { describe, it, expect } from 'vitest'
import { categorize } from './categorizer.js'

describe('categorize', () => {
  it('deve categorizar supermercado como food', () => {
    expect(categorize('Supermercado Carrefour')).toBe('food')
  })

  it('deve ser case-insensitive', () => {
    expect(categorize('SUPERMERCADO CARREFOUR')).toBe('food')
  })

  it('deve retornar other para descrição desconhecida', () => {
    expect(categorize('XYZ 123 DESCONHECIDO')).toBe('other')
  })
})
```

---

## Padrões de código

### TypeScript

```typescript
// ✅ Exports nomeados (não default)
export class MockConnector extends BaseConnector { ... }
export function categorize(desc: string): Category { ... }

// ✅ Tipos explícitos em APIs públicas
export async function getTransactions(): Promise<Transaction[]> { ... }

// ✅ Prefer const
const result = engine.analyze(transactions)

// ✅ ESM imports com extensão .js
import { categorize } from './categorizer.js'

// ❌ Evitar any
function process(data: any) { ... }  // use: unknown + type guard

// ❌ Evitar default export
export default class MockConnector { ... }
```

### Python

```python
# ✅ Type hints completos
from __future__ import annotations
from typing import Any

def generate_insights(result: dict[str, Any]) -> list[dict[str, Any]]:
    ...

# ✅ Docstrings em funções públicas
def complete(self, *, system: str, user: str, **kwargs) -> str:
    """
    Gera completion LLM.

    Args:
        system: Prompt de sistema
        user: Prompt do usuário

    Returns:
        Texto gerado
    """
    ...

# ✅ Dataclasses para structs
from dataclasses import dataclass

@dataclass
class InsightRequest:
    engine_result: dict[str, Any]
    max_insights: int = 5
```

### Commits

```
feat(pacote): descrição curta do que foi adicionado
fix(pacote): o que foi corrigido
docs(doc): o que foi documentado
test(pacote): o que foi testado
chore: manutenção, deps, configuração
refactor(pacote): refatoração sem mudança de comportamento
```

Exemplos:
```
feat(connector-csv): add support for semicolon-separated CSV
fix(core): correct percentage calculation in category breakdown
docs(06-ai-agents): add ollama docker example
test(connector-mock): add edge case for empty month
chore(deps): bump typescript to 5.7
```

---

## Checklist do PR

Antes de abrir o PR, verifique:

```
[ ] pnpm build passa sem erros
[ ] pnpm test passa (ou não há testes afetados)
[ ] pnpm lint sem warnings
[ ] Documentação atualizada (se API mudou)
[ ] .env.example atualizado (se nova variável)
[ ] CHANGELOG atualizado (para features/fixes significativos)
[ ] Branch atualizada com main (sem conflitos)
[ ] PR tem título descritivo no formato: feat(pacote): descrição
[ ] PR tem descrição explicando o que mudou e por quê
```

---

## Tipos de contribuição

### 🔌 Adicionar um Connector

1. Crie `packages/connector-NOME/`
2. Implemente `BaseConnector`
3. Adicione testes
4. Adicione documentação em `docs/04-connectors.md`
5. Registre no menu da CLI em `packages/cli/src/commands/start.ts`

### 🤖 Adicionar um LLM Provider

1. Crie `services/agents/src/agents/llm/NOME_provider.py`
2. Implemente `LLMProvider`
3. Registre em `registry.py` (built-ins) ou como entry point externo
4. Adicione documentação em `docs/06-ai-agents.md`
5. Adicione variáveis de exemplo ao `.env.example`

### 📖 Melhorar documentação

- Corrija typos e erros → PR direto
- Novos exemplos → PR direto
- Nova seção ou reestruturação → abra issue primeiro

### 🧪 Adicionar testes

Priorize:
- `packages/core/src/categorizer` — as regras de categorização
- `packages/connector-csv/src` — parser de diferentes formatos
- `packages/core/src/metrics` — cálculos financeiros

### 🐛 Corrigir bugs

1. Reproduza o bug com um teste que falha
2. Corrija o código
3. Confirme que o teste passa
4. Abra PR com o teste incluído

---

Obrigado por contribuir com o FinEngine OSS! 🚀

**Navegação:** [← Customização](10-customization.md) | [Índice →](00-summary.md)
