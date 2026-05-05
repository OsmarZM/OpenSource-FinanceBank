# 02 — Arquitetura

> **Design e estrutura do FinEngine OSS.**

**Navegação:** [← Getting Started](01-getting-started.md) | [Packages →](03-packages.md)

---

## Índice

- [Visão geral](#visão-geral)
- [Diagrama de alto nível](#diagrama-de-alto-nível)
- [Camadas do sistema](#camadas-do-sistema)
- [Fluxo de dados](#fluxo-de-dados)
- [Comunicação TS↔Python](#comunicação-tspython)
- [Dependências entre packages](#dependências-entre-packages)
- [Decisões de design](#decisões-de-design)

---

## Visão geral

O FinEngine é um **monorepo híbrido** (TypeScript + Python) organizado em camadas:

```
Entrada → Connectors → Core Engine → Agents (IA) → Saída
                           ↓
                        Storage
```

**Princípios:**
- **Local-first** — dados na sua máquina, sem telemetria
- **Provider-agnostic** — qualquer LLM, zero lock-in
- **Plugável** — connectors e agents são plugins independentes
- **Sem IA obrigatória** — funciona completo sem qualquer provider configurado

---

## Diagrama de alto nível

```mermaid
flowchart TD
    subgraph DATA_IN["🔌 Entrada de Dados"]
        direction TB
        MOCK["MockConnector\nDados simulados"]
        CSV["CsvConnector\nExtratos bancários"]
        PLUGGY["PluggyConnector\nOpen Finance (Fase 2)"]
        CUSTOM["Connector\nCustomizado"]
    end

    subgraph TYPES["📐 Types"]
        T["@fin-engine/types\nTransaction, Category, Insight…"]
    end

    subgraph ENGINE["⚙️ Core Engine"]
        direction TB
        CAT["Categorizer\n60+ regras BR"]
        METRICS["Metrics\nTotais, categorias, tendência"]
        PATTERNS["Pattern Detector\nTendências, recorrências"]
        INSIGHTS_RB["Insight Generator\nRule-based (sem IA)"]
    end

    subgraph BRIDGE["🌉 Bridge"]
        AB["AgentsBridge\nJSON-RPC stdio"]
    end

    subgraph AGENTS["🤖 Python Agents (opcional)"]
        direction TB
        REGISTRY["Provider Registry\nLLM_PROVIDER env"]
        LLM["LLM Provider\n(Bedrock/OpenAI/Ollama/…)"]
    end

    subgraph STORAGE["💾 Storage (opcional)"]
        DB["@fin-engine/database\nSupabase Client"]
        SUPA[(Supabase\nPostgreSQL)]
    end

    subgraph OUT["📤 Saída"]
        CLI["@fin-engine/cli\nTerminal colorido"]
        RESULT["EngineResult\nJSON estruturado"]
    end

    DATA_IN --> ENGINE
    TYPES -.->|"contratos"| ENGINE
    TYPES -.->|"contratos"| DATA_IN

    CAT --> METRICS
    METRICS --> PATTERNS
    PATTERNS --> INSIGHTS_RB

    INSIGHTS_RB --> BRIDGE
    BRIDGE --> REGISTRY
    REGISTRY --> LLM
    LLM -->|"AI Insights"| CLI

    INSIGHTS_RB --> CLI
    ENGINE --> RESULT
    RESULT --> DB
    DB --> SUPA

    style DATA_IN fill:#1a1a2e,stroke:#4cc9f0,color:#fff
    style ENGINE fill:#16213e,stroke:#7209b7,color:#fff
    style AGENTS fill:#0f3460,stroke:#f72585,color:#fff
    style STORAGE fill:#533483,stroke:#e94560,color:#fff
    style OUT fill:#1a1a2e,stroke:#4ade80,color:#fff
```

---

## Camadas do sistema

### Camada 1 — Types (`@fin-engine/types`)

Base de tudo. Define os contratos de dados que fluem pelo sistema:

```typescript
interface Transaction {
  id: string
  date: string          // ISO: "2024-01-15"
  description: string
  amount: number        // positivo = receita, negativo = despesa
  type: 'credit' | 'debit'
  category: Category
  source: string
  metadata?: Record<string, unknown>
}

type Category =
  | 'income' | 'housing' | 'food' | 'transport'
  | 'health' | 'education' | 'entertainment'
  | 'shopping' | 'utilities' | 'investment'
  | 'transfer' | 'fee' | 'other'
```

### Camada 2 — Connectors

Responsáveis por **buscar transações** de qualquer fonte:

```typescript
interface Connector {
  readonly name: string
  connect(): Promise<void>
  getTransactions(): Promise<Transaction[]>
}
```

Cada connector é um pacote independente (`@fin-engine/connector-*`).

### Camada 3 — Core Engine

O coração do sistema. Recebe `Transaction[]` e produz `EngineResult`:

```typescript
interface EngineResult {
  period: Period
  transactions: Transaction[]
  totalIncome: number
  totalExpenses: number
  balance: number
  savingsRate: number
  categoryBreakdown: CategoryBreakdown[]
  monthly: MonthlyData[]
  patterns: Pattern[]
  insights: Insight[]
}
```

Pipeline interno:

```mermaid
sequenceDiagram
    participant C as Connector
    participant E as Engine
    participant CAT as Categorizer
    participant M as Metrics
    participant P as Patterns
    participant I as Insights

    C->>E: Transaction[]
    E->>CAT: categorize(transactions)
    CAT-->>E: Transaction[] com categorias
    E->>M: computeTotals(transactions)
    M-->>E: income, expenses, balance
    E->>M: buildCategoryBreakdown(transactions)
    M-->>E: CategoryBreakdown[]
    E->>M: buildMonthlyData(transactions)
    M-->>E: MonthlyData[]
    E->>P: detectPatterns(transactions, monthly)
    P-->>E: Pattern[]
    E->>I: generateInsights(EngineResult parcial)
    I-->>E: Insight[]
    E-->>C: EngineResult completo
```

### Camada 4 — AI Agents (Python, opcional)

Sidecar Python que enriquece insights usando LLMs. Comunicação via JSON-RPC sobre stdio.

Veja: [06-ai-agents.md](06-ai-agents.md)

### Camada 5 — Storage (opcional)

Cliente Supabase para persistir análises. Veja: [07-database-supabase.md](07-database-supabase.md)

---

## Fluxo de dados

```mermaid
sequenceDiagram
    participant U as Usuário
    participant CLI as CLI
    participant CONN as Connector
    participant ENG as Engine
    participant AG as Python Agents
    participant DB as Supabase

    U->>CLI: pnpm demo (ou start)
    CLI->>CONN: connect() + getTransactions()
    CONN-->>CLI: Transaction[]
    CLI->>ENG: analyze(transactions)
    ENG-->>CLI: EngineResult

    alt LLM_PROVIDER != none
        CLI->>AG: JSON-RPC: generate_insights(result)
        AG-->>CLI: AI Insight[]
    end

    alt SUPABASE configurado
        CLI->>DB: saveAnalysisSession(result)
        DB-->>CLI: session_id
    end

    CLI->>U: Display colorido no terminal
```

---

## Comunicação TS↔Python

O sidecar Python é iniciado como subprocesso pelo `AgentsBridge`:

```mermaid
sequenceDiagram
    participant TS as TypeScript (CLI)
    participant BRIDGE as AgentsBridge
    participant PY as Python Process

    TS->>BRIDGE: callAgent('generate_insights', payload)
    BRIDGE->>PY: spawn('python -m agents')
    BRIDGE->>PY: JSON-RPC request (stdin)\n{"jsonrpc":"2.0","method":"generate_insights","params":{...},"id":1}
    PY-->>BRIDGE: JSON-RPC response (stdout)\n{"jsonrpc":"2.0","result":{...},"id":1}
    BRIDGE-->>TS: resultado parseado
```

**Protocolo:** [JSON-RPC 2.0](https://www.jsonrpc.org/specification) sobre stdio.

**Por que stdio?**
- Zero overhead de rede
- Sem autenticação necessária
- Funciona em qualquer OS
- Simples de debugar (você pode ver o JSON direto)

---

## Dependências entre packages

```mermaid
graph BT
    types["@fin-engine/types"]
    connectors_base["@fin-engine/connectors-base"]
    connector_mock["@fin-engine/connector-mock"]
    connector_csv["@fin-engine/connector-csv"]
    core["@fin-engine/core"]
    database["@fin-engine/database"]
    agents_bridge["@fin-engine/agents-bridge"]
    cli["@fin-engine/cli"]

    connectors_base --> types
    connector_mock --> connectors_base
    connector_mock --> types
    connector_csv --> connectors_base
    connector_csv --> types
    core --> types
    database --> types
    agents_bridge --> types
    cli --> core
    cli --> types
    cli --> connector_mock
    cli --> connector_csv
    cli --> database
    cli --> agents_bridge

    style types fill:#f72585,color:#fff
    style core fill:#7209b7,color:#fff
    style cli fill:#3a0ca3,color:#fff
```

O `types` é a única dependência de **todos** os outros packages — garante consistência de contratos.

---

## Decisões de design

### Por que TypeScript + Python?

| Aspecto | TypeScript | Python |
|---|---|---|
| CLI, I/O, parsing | ✅ Ecossistema excelente | ❌ Menos adequado |
| LLMs (Bedrock, OpenAI) | SDKs existem mas Python é padrão | ✅ Primeiro suporte |
| Data science futura | Funcional mas não ideal | ✅ NumPy, Pandas, OpenBB |
| Performance de build | tsup (esbuild) muito rápido | — |

### Por que pnpm + Turborepo?

- **pnpm**: hard links economizam disco; workspaces nativos
- **Turborepo**: cache inteligente de builds (se types não mudou, não reconstrói)
- **Alternativas consideradas**: Nx (mais pesado), Lerna (legado), yarn workspaces (sem cache)

### Por que JSON-RPC sobre stdio?

- **Alternativa HTTP**: requer gerenciamento de porta, mais latência, mais complexidade
- **Alternativa gRPC**: proto files, boilerplate, difícil de debugar
- **stdio**: sem servidor, sem portas, uma linha para matar (`process.kill(pid)`)

### Por que Supabase?

- PostgreSQL gerenciado com SDK TypeScript nativo
- Row Level Security built-in (fácil de configurar para single-user)
- Supabase CLI para migrations
- **Alternativa DuckDB**: ótimo para análise local mas sem sync remoto

---

**Navegação:** [← Getting Started](01-getting-started.md) | [Packages →](03-packages.md)
