FROM node:18-slim as development
LABEL maintainer="Krzysztof Durek <walendes@gmail.com>"
RUN apt-get update
RUN apt-get install -y openssl
WORKDIR /usr/src/backend
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}
COPY package.json yarn.lock tsconfig.json ./
RUN yarn install
COPY prisma ./prisma
RUN yarn prisma generate
ENV PATH /usr/src/backend/node_modules/.bin:$PATH
WORKDIR /usr/src/backend/app
CMD ["yarn", "start:development"]

FROM node:18-slim as builder
RUN apt-get update
RUN apt-get install -y openssl
WORKDIR /usr/src/backend
COPY package.json yarn.lock tsconfig.json ./
RUN yarn install
COPY . .
RUN yarn build

FROM node:18-slim as production
LABEL maintainer="Krzysztof Durek <walendes@gmail.com>"
RUN apt-get update
RUN apt-get install -y openssl
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /usr/src/backend
COPY package.json yarn.lock tsconfig.json ./
RUN yarn install --production
COPY prisma ./prisma
RUN yarn prisma generate
COPY --from=builder /usr/src/backend/dist ./dist
CMD ["yarn", "start:production"]
