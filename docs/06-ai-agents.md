# 06 — AI Agents

> **Como usar e criar providers de IA no FinEngine. Sistema 100% plugável — sem lock-in.**

**Navegação:** [← Core Engine](05-core-engine.md) | [Database →](07-database-supabase.md)

---

## Índice

- [Visão geral](#visão-geral)
- [Como funciona](#como-funciona)
- [Providers disponíveis](#providers-disponíveis)
- [Configurar AWS Bedrock](#configurar-aws-bedrock)
- [Configurar OpenAI](#configurar-openai)
- [Configurar Anthropic](#configurar-anthropic)
- [Configurar Ollama (grátis, local)](#configurar-ollama-grátis-local)
- [Configurar Google Gemini](#configurar-google-gemini)
- [Criar um provider customizado](#criar-um-provider-customizado)
- [Sem IA (padrão)](#sem-ia-padrão)

---

## Visão geral

O sistema de IA é um **sidecar Python opcional** que enriquece os insights gerados pelo Core Engine com análise de linguagem natural.

**Sem IA:** insights baseados em regras (determinísticos, rápidos, sempre disponíveis)  
**Com IA:** insights enriquecidos com contexto, sugestões personalizadas, explicações em português

---

## Como funciona

```mermaid
sequenceDiagram
    participant CLI as TypeScript CLI
    participant BRIDGE as AgentsBridge
    participant PY as Python Sidecar
    participant LLM as LLM Provider

    CLI->>BRIDGE: generateInsights(engineResult)
    BRIDGE->>PY: spawn: python -m agents
    BRIDGE->>PY: JSON-RPC stdin:\n{"method":"generate_insights","params":{...}}
    PY->>PY: registry.py: carrega LLM_PROVIDER
    PY->>LLM: complete(system_prompt, user_prompt)
    LLM-->>PY: texto de resposta
    PY->>PY: parseia resposta em Insight[]
    PY-->>BRIDGE: JSON-RPC stdout:\n{"result":{"insights":[...]}}
    BRIDGE-->>CLI: Insight[]
    CLI->>CLI: exibe insights da IA junto com rule-based
```

### Registry (descoberta de providers)

```python
# services/agents/src/agents/llm/registry.py

def get_provider() -> LLMProvider:
    provider_name = os.getenv("LLM_PROVIDER", "none")

    if provider_name == "none":
        raise ValueError("LLM_PROVIDER=none")

    # Tenta os providers built-in
    BUILTIN = {
        "bedrock": BedrockProvider,
        "openai": OpenAIProvider,
        "anthropic": AnthropicProvider,
        "ollama": OllamaProvider,
        "gemini": GeminiProvider,
    }
    if provider_name in BUILTIN:
        return BUILTIN[provider_name]()

    # Procura plugins de terceiros via setuptools entry points
    for ep in importlib.metadata.entry_points(
        group="fin_engine.llm_providers"
    ):
        if ep.name == provider_name:
            return ep.load()()

    raise ValueError(f"Provider desconhecido: {provider_name}")
```

---

## Providers disponíveis

| Provider | `LLM_PROVIDER` | Custo | Requer |
|---|---|---|---|
| AWS Bedrock | `bedrock` | Pay-per-use | Conta AWS + chave |
| OpenAI | `openai` | Pay-per-use | API Key |
| Anthropic | `anthropic` | Pay-per-use | API Key |
| Ollama | `ollama` | **Grátis** (local) | Ollama instalado |
| Google Gemini | `gemini` | Free tier generoso | API Key |
| Nenhum | `none` (padrão) | Grátis | — |

---

## Configurar AWS Bedrock

AWS Bedrock dá acesso ao Claude (Anthropic), Llama, Titan e outros modelos via API AWS.

### Pré-requisitos

1. Conta AWS com acesso ao Bedrock
2. Habilitar o modelo desejado em [Bedrock Console → Model Access](https://console.aws.amazon.com/bedrock/home#/modelaccess)
3. Credenciais de acesso

### Opção 1: Bearer Token (mais simples)

```env
LLM_PROVIDER=bedrock
LLM_MODEL=anthropic.claude-3-5-sonnet-20241022-v2:0
AWS_REGION=us-east-1
AWS_BEARER_TOKEN_BEDROCK=seu-bearer-token
```

### Opção 2: Chaves de acesso IAM

```env
LLM_PROVIDER=bedrock
LLM_MODEL=anthropic.claude-3-5-sonnet-20241022-v2:0
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

### Modelos disponíveis no Bedrock

| Modelo | ID | Qualidade | Custo |
|---|---|---|---|
| Claude 3.5 Sonnet | `anthropic.claude-3-5-sonnet-20241022-v2:0` | ⭐⭐⭐⭐⭐ | $$$ |
| Claude 3 Haiku | `anthropic.claude-3-haiku-20240307-v1:0` | ⭐⭐⭐ | $ |
| Llama 3 70B | `meta.llama3-70b-instruct-v1:0` | ⭐⭐⭐⭐ | $$ |

---

## Configurar OpenAI

```env
LLM_PROVIDER=openai
LLM_MODEL=gpt-4o-mini
OPENAI_API_KEY=sk-proj-...
```

### Modelos recomendados

| Modelo | Qualidade | Custo/1K tokens |
|---|---|---|
| `gpt-4o` | ⭐⭐⭐⭐⭐ | $0.005 |
| `gpt-4o-mini` | ⭐⭐⭐⭐ | $0.00015 |
| `gpt-3.5-turbo` | ⭐⭐⭐ | $0.0005 |

> Para análises financeiras, `gpt-4o-mini` oferece ótimo custo-benefício.

---

## Configurar Anthropic

Acesso direto à API Anthropic (sem passar pela AWS).

```env
LLM_PROVIDER=anthropic
LLM_MODEL=claude-3-5-sonnet-20241022
ANTHROPIC_API_KEY=sk-ant-api03-...
```

---

## Configurar Ollama (grátis, local)

Ollama roda modelos LLM localmente. **Completamente gratuito, sem envio de dados para internet.**

### Instalação

```bash
# macOS
brew install ollama

# Windows
# Baixe em https://ollama.ai/download

# Linux
curl -fsSL https://ollama.ai/install.sh | sh
```

### Baixar um modelo

```bash
ollama pull llama3          # 4.7GB — recomendado para análise
ollama pull mistral         # 4.1GB — rápido e eficiente
ollama pull phi3            # 2.3GB — leve, bom para máquinas modestas
```

### Configurar

```env
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3
```

### Iniciar o servidor Ollama

```bash
ollama serve
# Ollama rodando em http://localhost:11434
```

### Via Docker

```bash
docker compose --profile ollama up
# Ollama no container, acessível em http://ollama:11434
```

---

## Configurar Google Gemini

```env
LLM_PROVIDER=gemini
LLM_MODEL=gemini-1.5-flash
GEMINI_API_KEY=AIzaSy...
```

Obtenha sua API key em [Google AI Studio](https://aistudio.google.com/apikey).

### Modelos disponíveis

| Modelo | Free tier | Qualidade |
|---|---|---|
| `gemini-1.5-flash` | 15 req/min grátis | ⭐⭐⭐⭐ |
| `gemini-1.5-pro` | 2 req/min grátis | ⭐⭐⭐⭐⭐ |

---

## Criar um provider customizado

O sistema usa **setuptools entry points** para descobrir providers de terceiros — sem modificar o código principal.

### Passo 1: Criar o package Python

```
meu-llm-provider/
├── pyproject.toml
└── src/
    └── meu_provider/
        ├── __init__.py
        └── provider.py
```

**`provider.py`:**
```python
from __future__ import annotations
from agents.llm.base import LLMProvider


class MeuProvider(LLMProvider):
    """Provider customizado para Minha API."""

    @property
    def name(self) -> str:
        return "meu-provider"

    def complete(self, *, system: str, user: str, **kwargs) -> str:
        """
        Chama sua API e retorna o texto gerado.

        Args:
            system: Prompt de sistema (instruções)
            user: Prompt do usuário (dados financeiros)

        Returns:
            Texto gerado pelo modelo
        """
        import requests
        import os

        response = requests.post(
            "https://minha-api.com/v1/generate",
            headers={"Authorization": f"Bearer {os.getenv('MINHA_API_KEY')}"},
            json={"system": system, "user": user},
        )
        return response.json()["text"]
```

### Passo 2: Registrar via entry points

**`pyproject.toml`:**
```toml
[project]
name = "meu-llm-provider"
version = "0.1.0"
dependencies = ["requests", "fin-engine-agents"]

[project.entry-points."fin_engine.llm_providers"]
meu-provider = "meu_provider.provider:MeuProvider"
```

### Passo 3: Instalar e usar

```bash
cd services/agents
uv pip install -e /caminho/para/meu-llm-provider

# No .env:
LLM_PROVIDER=meu-provider
MINHA_API_KEY=...
```

### Interface LLMProvider

```python
# services/agents/src/agents/llm/base.py

from abc import ABC, abstractmethod


class LLMProvider(ABC):
    """Interface base para todos os providers de LLM."""

    @property
    @abstractmethod
    def name(self) -> str:
        """Identificador único do provider (ex: 'bedrock', 'openai')."""
        ...

    @abstractmethod
    def complete(self, *, system: str, user: str, **kwargs) -> str:
        """
        Gera uma completion dado um sistema e um prompt de usuário.

        Args:
            system: Instruções de sistema para o modelo
            user: Prompt do usuário com os dados a analisar

        Returns:
            Texto gerado pelo modelo

        Raises:
            LLMError: Se a chamada ao provider falhar
        """
        ...
```

---

## Sem IA (padrão)

Com `LLM_PROVIDER=none` (ou sem configurar), o sistema funciona normalmente com análise baseada em regras:

```
✅ Categorização automática (60+ regras)
✅ Métricas completas (totais, categorias, tendências)
✅ Detecção de padrões (high_spending, spending_increase, recurring, low_savings)
✅ Insights determinísticos (poupança baixa, tendências, alertas)
❌ Insights enriquecidos por linguagem natural
```

A análise sem IA é **100% offline**, **instantânea** e **gratuita**.

---

**Navegação:** [← Core Engine](05-core-engine.md) | [Database →](07-database-supabase.md)
