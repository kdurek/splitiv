# ─── Base: Node + pnpm ────────────────────────────────────────────────────────
FROM node:24-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

# ─── Deps: install workspace dependencies ─────────────────────────────────────
FROM base AS deps
WORKDIR /app

# Copy workspace manifests before source so this layer is cached until deps change
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/auth/package.json ./packages/auth/
COPY packages/db/package.json ./packages/db/
COPY packages/ui/package.json ./packages/ui/
COPY tooling/tsconfig/package.json ./tooling/tsconfig/

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --ignore-scripts

# ─── Builder: compile the app ─────────────────────────────────────────────────
FROM deps AS builder
WORKDIR /app
COPY . .
RUN pnpm build:web

# ─── Runner: minimal production image ─────────────────────────────────────────
FROM node:24-alpine AS runner

# dumb-init reaps zombie processes and forwards signals correctly when PID 1
RUN apk add --no-cache dumb-init

# Non-root user
RUN addgroup --system --gid 1001 nodejs && adduser  --system --uid 1001 app

WORKDIR /app

# Self-contained Nitro SSR output
COPY --from=builder --chown=app:nodejs /app/apps/web/.output ./.output

COPY --chown=app:nodejs docker-entrypoint.sh .
RUN chmod +x docker-entrypoint.sh

USER app

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--", "./docker-entrypoint.sh"]
