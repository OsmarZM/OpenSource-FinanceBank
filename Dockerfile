# ─── Stage 1: Dependencies ────────────────────────────────────────────────────
FROM node:20-alpine AS deps

RUN npm install -g pnpm@10

WORKDIR /app

# Copy workspace manifests first for layer caching
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/types/package.json             ./packages/types/
COPY packages/connectors-base/package.json   ./packages/connectors-base/
COPY packages/connector-mock/package.json    ./packages/connector-mock/
COPY packages/connector-csv/package.json     ./packages/connector-csv/
COPY packages/core/package.json              ./packages/core/
COPY packages/database/package.json          ./packages/database/
COPY packages/cli/package.json               ./packages/cli/
COPY apps/demo/package.json                  ./apps/demo/

RUN pnpm install --frozen-lockfile

# ─── Stage 2: Build ───────────────────────────────────────────────────────────
FROM deps AS builder

COPY packages/ ./packages/
COPY apps/     ./apps/
COPY turbo.json tsconfig.base.json ./

RUN pnpm build

# ─── Stage 3: Runtime (minimal image) ────────────────────────────────────────
FROM node:20-alpine AS runner

RUN npm install -g pnpm@10

WORKDIR /app

# Copy only what's needed to run
COPY --from=builder /app/node_modules          ./node_modules
COPY --from=builder /app/packages              ./packages
COPY --from=builder /app/apps                  ./apps
COPY --from=builder /app/package.json          ./package.json
COPY --from=builder /app/pnpm-workspace.yaml   ./pnpm-workspace.yaml
COPY examples/                                 ./examples/

ENV NODE_ENV=production
ENV LLM_PROVIDER=none

# Interactive TTY for CLI
LABEL org.opencontainers.image.title="FinEngine OSS"
LABEL org.opencontainers.image.description="Financial Intelligence Engine — Open Source"
LABEL org.opencontainers.image.source="https://github.com/OsmarZM/OpenSource-FinanceBank"
LABEL org.opencontainers.image.licenses="MIT"

CMD ["node", "packages/cli/dist/index.js", "demo"]
