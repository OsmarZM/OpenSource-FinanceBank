# 09 — CLI Reference

> **Referência completa de todos os comandos, opções e exemplos.**

**Navegação:** [← Docker](08-docker.md) | [Customização →](10-customization.md)

---

## Índice

- [Instalação do binário](#instalação-do-binário)
- [Comandos disponíveis](#comandos-disponíveis)
- [fin-engine demo](#fin-engine-demo)
- [fin-engine start](#fin-engine-start)
- [Opções globais](#opções-globais)
- [Variáveis de ambiente relevantes](#variáveis-de-ambiente-relevantes)
- [Exemplos de uso](#exemplos-de-uso)
- [Saída e formatação](#saída-e-formatação)
- [Códigos de saída](#códigos-de-saída)

---

## Instalação do binário

Após build, o CLI fica disponível em:

```
packages/cli/dist/index.js
```

Formas de executar:

```bash
# Via pnpm scripts (mais simples)
pnpm demo
pnpm start

# Via node diretamente
node packages/cli/dist/index.js demo
node packages/cli/dist/index.js start
node packages/cli/dist/index.js --help

# Via pnpm filter
pnpm --filter @fin-engine/cli run dev
```

### Instalar globalmente (opcional)

```bash
pnpm build
npm install -g .  # na raiz do projeto
fin-engine demo   # agora disponível globalmente
```

---

## Comandos disponíveis

```
fin-engine [opções] [comando]

Comandos:
  demo      Análise instantânea com dados simulados
  start     Menu interativo para configurar e executar análise

Opções:
  -V, --version   Exibe versão
  -h, --help      Exibe ajuda
```

---

## fin-engine demo

Executa uma análise completa usando dados financeiros simulados (MockConnector).

```bash
fin-engine demo
# equivalente a:
pnpm demo
```

**O que faz:**
1. Gera ~126 transações simuladas (90 dias, mercado BR)
2. Categoriza automaticamente todas as transações
3. Calcula métricas, padrões e insights
4. Exibe resultado formatado no terminal

**Não requer nenhuma configuração.**

**Exemplo de output:**

```
🚀  FinEngine OSS — Modo Demo
  Usando dados financeiros simulados para demonstração

✔ 126 transações analisadas

╭─────────────────────────────────────────────────╮
│  💰 FinEngine OSS — Análise Financeira          │
│  Período: 04/02/2026 – 09/05/2026 (94 dias)    │
│  126 transações analisadas                       │
╰─────────────────────────────────────────────────╯

📊  RESUMO FINANCEIRO
  Receitas          R$ 26.300,00
  Despesas          R$ 24.478,80
  ──────────────────────────────
  Saldo              R$ 1.821,20
  Poupança                  6.9%

📂  GASTOS POR CATEGORIA
  Moradia          R$  9.000,00  36.8%  ███████░░░░░░░░░░░░░
  Alimentação      R$  6.057,00  24.7%  █████░░░░░░░░░░░░░░░
  Transporte       R$  2.840,00  11.6%  ██░░░░░░░░░░░░░░░░░░
  Saúde            R$  1.920,00   7.8%  █░░░░░░░░░░░░░░░░░░░
  Entretenimento   R$  1.650,50   6.7%  █░░░░░░░░░░░░░░░░░░░
  Utilidades       R$  1.450,00   5.9%  █░░░░░░░░░░░░░░░░░░░
  Compras          R$    862,10   3.5%  ░░░░░░░░░░░░░░░░░░░░
  Educação         R$    599,20   2.4%  ░░░░░░░░░░░░░░░░░░░░
  Outros           R$    100,00   0.4%  ░░░░░░░░░░░░░░░░░░░░

📈  TENDÊNCIA MENSAL
  Fev/2026: Receitas R$ 9.200 | Despesas R$ 7.980 | Poupança 13.3%
  Mar/2026: Receitas R$ 9.400 | Despesas R$ 8.120 | Poupança 13.6%
  Abr/2026: Receitas R$ 7.700 | Despesas R$ 8.378 | Poupança -8.8%

💡  INSIGHTS
  🚨  Taxa de poupança muito baixa: 6.9%
      Recomendado: pelo menos 20% de poupança mensal.
  ⚠️   Gastos com alimentação aumentaram 35% no período
      Tendência de alta detectada nos últimos 30 dias.
  ⚠️   Moradia representa 36.8% das despesas totais
      A regra 50/30/20 sugere no máximo 30% para necessidades fixas.
  ℹ️   Assinatura recorrente detectada: Netflix — R$ 55,90/mês
  ℹ️   Assinatura recorrente detectada: Spotify — R$ 21,90/mês
```

---

## fin-engine start

Abre o menu interativo para selecionar a fonte de dados e executar a análise.

```bash
fin-engine start
# equivalente a:
pnpm start
```

**Fluxo:**

```
? Selecione a fonte de dados:
  ❯ 🎮 Demo (dados simulados)
    📄 Importar CSV
    🏦 Pluggy — Open Finance (em breve)

# Se CSV selecionado:
? Caminho do arquivo CSV: examples/sample.csv

✔ 55 transações importadas de examples/sample.csv

[exibe análise...]
```

### Opções do menu

| Opção | Descrição |
|---|---|
| 🎮 Demo | Usa MockConnector (dados simulados) |
| 📄 Importar CSV | Pede caminho do arquivo; usa CsvConnector |
| 🏦 Pluggy | Open Finance (disponível na Fase 2) |

---

## Opções globais

| Flag | Descrição |
|---|---|
| `-V, --version` | Exibe a versão do CLI |
| `-h, --help` | Exibe ajuda |

```bash
fin-engine --version
# 1.0.0

fin-engine --help
# Usage: fin-engine [options] [command]
# ...

fin-engine demo --help
# Usage: fin-engine demo [options]
# ...
```

---

## Variáveis de ambiente relevantes

| Variável | Default | Efeito no CLI |
|---|---|---|
| `LLM_PROVIDER` | `none` | Ativa análise com IA se configurado |
| `SUPABASE_URL` | — | Ativa persistência se configurado |
| `SUPABASE_ANON_KEY` | — | Par com SUPABASE_URL |
| `NO_COLOR` | — | Desativa cores no output (útil em CI) |
| `FORCE_COLOR` | — | Força cores mesmo sem TTY |

---

## Exemplos de uso

### Demo básico

```bash
pnpm demo
```

### CSV do Nubank

```bash
# Exporte pelo app: Perfil → Exportar transações
node packages/cli/dist/index.js start
# → Importar CSV → /Downloads/nubank-2024.csv
```

### CSV em caminho com espaços (Windows)

```bash
node packages/cli/dist/index.js start
# → Importar CSV → "C:\Users\Nome\Documents\Extrato Bradesco.csv"
```

### Via Docker

```bash
docker run --rm -it \
  -v $(pwd)/extrato.csv:/app/data/extrato.csv \
  fin-engine node packages/cli/dist/index.js start
# → Importar CSV → /app/data/extrato.csv
```

### Redirecionar output

```bash
# Output para arquivo (remove cores)
NO_COLOR=1 node packages/cli/dist/index.js demo > analise.txt

# Output com cores em pipe (ex: less)
FORCE_COLOR=1 node packages/cli/dist/index.js demo | less -R
```

---

## Saída e formatação

O CLI usa:
- **chalk** para cores ANSI (auto-detecta suporte a cores do terminal)
- **boxen** para caixas decorativas
- **ora** para spinners de loading
- **@inquirer/prompts** para menus interativos

### Estrutura do output

```
[spinner] Carregando...    ← ora
[spinner] Analisando...

╭────────────────╮
│  Título        │  ← boxen
╰────────────────╯

SEÇÃO               ← chalk bold cyan
  Item  Valor       ← chalk normal / green / red

💡 INSIGHTS         ← emoji + chalk
  🚨 Alerta         ← chalk red
  ⚠️  Warning        ← chalk yellow
  ℹ️  Info           ← chalk blue
```

---

## Códigos de saída

| Código | Significado |
|---|---|
| `0` | Sucesso |
| `1` | Erro genérico (arquivo não encontrado, parse error, etc.) |
| `130` | Interrompido pelo usuário (Ctrl+C) |

---

**Navegação:** [← Docker](08-docker.md) | [Customização →](10-customization.md)
