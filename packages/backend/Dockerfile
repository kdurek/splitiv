FROM node:18-alpine AS base
LABEL maintainer="Krzysztof Durek <walendes@gmail.com>"
RUN npm --no-update-notifier --no-fund --global install pnpm
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /usr/src/backend
COPY packages/backend/package.json ./
COPY pnpm-lock.yaml ./
RUN pnpm install --prod
COPY packages/backend/prisma ./prisma
RUN pnpm dlx prisma generate

FROM node:18-alpine
LABEL maintainer="Krzysztof Durek <walendes@gmail.com>"
WORKDIR /usr/src/backend
COPY packages/backend/dist ./dist
COPY --from=base /usr/src/backend/node_modules ./node_modules
COPY --from=base /usr/src/backend/prisma ./prisma
CMD ["node", "./dist/index.js"]
