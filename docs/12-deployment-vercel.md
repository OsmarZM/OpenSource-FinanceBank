# 🚀 Deployment no Vercel

Este projeto é um **monorepo Turbo com pnpm**. Para fazer deploy no Vercel, siga os passos abaixo.

## **Pré-requisitos**

- ✅ Conta no Vercel (https://vercel.com)
- ✅ Repositório no GitHub conectado
- ✅ Node.js 20+ (Vercel usa automaticamente)

## **Configuração no Vercel**

### **1. Conectar Repositório**

1. Acesse https://vercel.com/new
2. Clique em "Import Git Repository"
3. Selecione `OsmarZM/OpenSource-FinanceBank`
4. Clique em "Import"

### **2. Configurar Projeto**

Na tela de "Configure Project":

- **Project Name**: `finengine` (ou seu nome)
- **Framework Preset**: `Next.js` (selecionado automaticamente)
- **Root Directory**: Deixe em branco (vercel.json já configura como `apps/web`)
- **Build Command**: Deixe em branco (vercel.json já define)
- **Output Directory**: Deixe em branco (Next.js automático)
- **Install Command**: Deixe em branco (vercel.json já define)

### **3. Variáveis de Ambiente**

Clique em "Environment Variables" e adicione:

```
PLUGGY_CLIENT_ID → [sua credencial sandbox]
PLUGGY_CLIENT_SECRET → [sua credencial sandbox]
OPENBB_URL → https://openbb.api.example.com (se usar)
AWS_BEARER_TOKEN_BEDROCK → [seu token AWS]
AWS_REGION → us-west-2
BEDROCK_MODEL_ID → anthropic.claude-haiku-4-5-20251022-v1:0
NEXT_PUBLIC_APP_URL → https://seu-app.vercel.app
```

⚠️ **Variáveis com `NEXT_PUBLIC_` são públicas** (usadas no cliente)

### **4. Deploy**

Clique em "Deploy" e aguarde! 

A build leva ~3-5 minutos na primeira vez.

---

## **Verificar Deploy**

Após sucesso:

```
✅ Build completado
✅ Ambiente ao vivo em: https://seu-app.vercel.app
✅ Logs disponíveis em: Vercel Dashboard → Deployments
```

---

## **Troubleshooting**

### **❌ Erro: "Cannot find module pnpm"**

**Solução**: Vercel.json já tem `installCommand` com `corepack enable pnpm`

### **❌ Erro: "Build failed - package not found"**

**Possível causa**: Algum package está sem build script
**Solução**: Rodar `pnpm run build` localmente primeiro para testar

### **❌ Erro: "Cannot find apps/web"**

**Solução**: Verifique se `root: "apps/web"` está em `vercel.json`

### **❌ Erro: "API timeout connecting to localhost:3004"**

**Normal!** OpenBB está em desenvolvimento local. O Vercel vai usar fallback para mock data.

---

## **Atualizações Automáticas**

Toda vez que você faz `push` para `main`:

1. Vercel detecta automaticamente
2. Inicia novo build
3. Deploy automático se bem-sucedido
4. Seu site atualiza em tempo real

---

## **Desativar Automático (opcional)**

Se quiser revisar antes de fazer deploy:

1. Vercel Dashboard → Settings → Git
2. Desative "Automatically deploy on push"
3. Use "Deploy" manual quando pronto

---

## **Verificar Logs**

Se algo der errado:

1. Vercel Dashboard → Deployments
2. Clique no deploy recente
3. Abra "Build Logs" para detalhes

---

## **Rollback**

Se precisa reverter:

1. Vercel Dashboard → Deployments
2. Passe o mouse sobre um deploy anterior
3. Clique em "Promote to Production"

---

## **Contato & Suporte**

- 📚 Docs: https://vercel.com/docs/nextjs
- 🐛 Issues: GitHub → Abra uma issue
- 💬 Comunidade: Vercel Community & GitHub Discussions
