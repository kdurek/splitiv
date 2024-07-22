FROM node:20.15.1-alpine AS base
RUN corepack enable

# Dependencies
FROM base AS deps
WORKDIR /app

COPY prisma ./
COPY package.json pnpm-lock.yaml* ./

RUN pnpm i --frozen-lockfile

# Build
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV SKIP_ENV_VALIDATION 1
ENV NEXT_TELEMETRY_DISABLED 1
ENV NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY BD6U9I_mAjv30SVYy1ZbsWlsUpLWeBC9VfZspkeFbN5kkbXOunRZ4rKE3LxeDkNBvy_sYsvIOdg6AOBJAXMRyu4

RUN pnpm build

# Production
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/start.sh ./start.sh
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["./start.sh"]
