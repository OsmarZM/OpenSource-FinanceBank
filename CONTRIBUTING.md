# Guia de Contribuição — FinEngine OSS

Obrigado pelo interesse em contribuir! Este documento explica como participar do projeto de forma efetiva.

## Índice

- [Código de Conduta](#código-de-conduta)
- [Como posso contribuir?](#como-posso-contribuir)
- [Setup do ambiente](#setup-do-ambiente)
- [Fluxo de desenvolvimento](#fluxo-de-desenvolvimento)
- [Padrões de código](#padrões-de-código)
- [Convenção de commits](#convenção-de-commits)
- [Pull Requests](#pull-requests)
- [Reportar bugs](#reportar-bugs)
- [Sugerir features](#sugerir-features)

---

## Código de Conduta

Este projeto adota um ambiente inclusivo e respeitoso. Esperamos que todos os participantes:

- Usem linguagem acolhedora e inclusiva
- Respeitem pontos de vista diferentes
- Aceitem críticas construtivas com profissionalismo
- Foquem no que é melhor para a comunidade

Comportamentos inaceitáveis serão reportados ao mantenedor: Osmar_zanateli@hotmail.com

---

## Como posso contribuir?

### 🐛 Corrigindo bugs
1. Verifique se o bug já foi reportado nas [Issues](https://github.com/OsmarZM/OpenSource-FinanceBank/issues)
2. Se não, abra uma issue descrevendo o problema
3. Faça um fork, corrija e abra um Pull Request

### ✨ Adicionando features
1. Abra uma issue com a tag `enhancement` descrevendo a feature
2. Aguarde discussão e aprovação antes de implementar
3. Implemente seguindo as convenções do projeto

### 📖 Melhorando documentação
- Correções de texto, exemplos, tradução → PR direto
- Novas seções ou reestruturação → issue primeiro

### 🔌 Criando um Connector
Veja o guia: [docs/04-connectors.md](docs/04-connectors.md)

### 🤖 Adicionando um LLM Provider
Veja o guia: [docs/06-ai-agents.md](docs/06-ai-agents.md)

---

## Setup do ambiente

### Pré-requisitos

- [Node.js 20+](https://nodejs.org)
- [pnpm 10+](https://pnpm.io) — `npm install -g pnpm`
- Python 3.11+ (para trabalhar com `services/agents`)
- Git

### Instalação

```bash
# Fork e clone
git clone https://github.com/SEU_USUARIO/OpenSource-FinanceBank.git
cd OpenSource-FinanceBank

# Adicione o upstream
git remote add upstream https://github.com/OsmarZM/OpenSource-FinanceBank.git

# Instale dependências
pnpm install

# Build inicial
pnpm build

# Verifique que tudo funciona
pnpm demo
```

### Variáveis de ambiente para dev

```bash
cp .env.example .env
# Edite .env conforme necessário
# Para desenvolvimento básico, nenhuma variável é obrigatória
```

---

## Fluxo de desenvolvimento

```
main
 └── feature/minha-feature      ← crie aqui
      └── fix: correção          ← commits
      └── feat: nova função
      └── PR → main             ← Pull Request
```

### Passo a passo

```bash
# 1. Sincronize com o upstream
git fetch upstream
git checkout main
git merge upstream/main

# 2. Crie uma branch
git checkout -b feature/nome-da-feature

# 3. Desenvolva
pnpm dev   # modo watch nos packages

# 4. Teste
pnpm test

# 5. Lint
pnpm lint

# 6. Commit
git add .
git commit -m "feat(core): add spending limit alerts"

# 7. Push e abra PR
git push origin feature/nome-da-feature
```

---

## Padrões de código

### TypeScript

- **Linguagem**: TypeScript estrito (`"strict": true` no tsconfig)
- **Formatação**: Prettier (automático via `pnpm lint`)
- **Imports**: ESM (`import`/`export`), sem CommonJS
- **Types**: prefira tipos explícitos em APIs públicas; `interface` para tipos de dados
- **Naming**: camelCase para funções/variáveis, PascalCase para classes/interfaces

```typescript
// ✅ Bom
export interface TransactionFilter {
  category?: Category
  dateFrom?: string
  dateTo?: string
}

export async function filterTransactions(
  transactions: Transaction[],
  filter: TransactionFilter,
): Promise<Transaction[]> {
  // ...
}

// ❌ Evitar
export function filter_txs(txs: any[], f: any) { ... }
```

### Python

- **Versão**: Python 3.11+
- **Tipo**: type hints obrigatórios (`from __future__ import annotations`)
- **Linting**: ruff (`ruff check src/`)
- **Type checking**: mypy (`mypy src/`)
- **Naming**: snake_case para funções/variáveis, PascalCase para classes

```python
# ✅ Bom
from __future__ import annotations

def generate_insights(engine_result: dict[str, Any]) -> list[dict[str, Any]]:
    ...

# ❌ Evitar
def generate(r):
    ...
```

### Estrutura de arquivos

- Novos packages TypeScript: siga o padrão de `packages/connector-mock`
- Novos serviços Python: siga o padrão de `services/agents`
- Toda lógica de negócio vai em `packages/core`, não na CLI
- A CLI só deve orquestrar — nada de regras de negócio nela

---

## Convenção de commits

Seguimos o [Conventional Commits](https://www.conventionalcommits.org):

```
<tipo>(<escopo>): <descrição curta>

[corpo opcional]

[rodapé opcional]
```

### Tipos

| Tipo | Quando usar |
|---|---|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `docs` | Apenas documentação |
| `style` | Formatação, sem mudança de lógica |
| `refactor` | Refatoração sem feat nem fix |
| `test` | Adição ou correção de testes |
| `chore` | Manutenção, deps, configs |
| `perf` | Melhoria de performance |

### Exemplos

```bash
git commit -m "feat(connector-csv): add BRL currency format detection"
git commit -m "fix(core): correct savings rate calculation for zero-income months"
git commit -m "docs(agents): add custom provider example"
git commit -m "chore(deps): bump @supabase/supabase-js to 2.47.0"
```

---

## Pull Requests

### Checklist antes de abrir o PR

- [ ] `pnpm build` passa sem erros
- [ ] `pnpm test` passa (quando aplicável)
- [ ] `pnpm lint` sem warnings
- [ ] Documentação atualizada (se mudança de API)
- [ ] `.env.example` atualizado (se nova variável)
- [ ] Branch atualizada com `main`

### Template de PR

```markdown
## O que este PR faz?
Breve descrição da mudança.

## Tipo de mudança
- [ ] Bug fix
- [ ] Nova feature
- [ ] Breaking change
- [ ] Docs

## Testado com
- [ ] `pnpm demo`
- [ ] `pnpm test`
- [ ] Manualmente (descreva)

## Screenshots (se relevante)
```

---

## Reportar bugs

Use o template de issue de bug:

```markdown
**Descreva o bug**
O que aconteceu vs. o que era esperado.

**Como reproduzir**
1. Execute `pnpm demo`
2. ...

**Ambiente**
- OS: Windows 11 / macOS 14 / Ubuntu 22
- Node.js: v20.x
- pnpm: v10.x

**Logs**
```
cole aqui o erro completo
```
```

---

## Sugerir features

Use o template de issue de feature:

```markdown
**Sua sugestão está relacionada a um problema?**
Ex: "Fico frustrado quando..."

**Descreva a solução desejada**
O que você gostaria que acontecesse.

**Alternativas consideradas**
Outras soluções que você pensou.

**Contexto adicional**
Screenshots, mockups, referências.
```

---

## Onde pedir ajuda?

- 📖 [Documentação](docs/00-summary.md)
- 🐛 [Issues](https://github.com/OsmarZM/OpenSource-FinanceBank/issues)
- ✉️ Email: Osmar_zanateli@hotmail.com

---

Obrigado por contribuir! 🚀
