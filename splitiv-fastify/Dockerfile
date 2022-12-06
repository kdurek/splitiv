FROM --platform=linux/amd64 node:18-alpine as development
LABEL maintainer="Krzysztof Durek <walendes@gmail.com>"
WORKDIR /usr/src/backend
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}
COPY package.json yarn.lock tsconfig.json ./
RUN yarn
COPY prisma ./prisma
RUN yarn prisma generate
CMD ["yarn", "start:development"]

FROM --platform=linux/amd64 node:18-alpine as production
LABEL maintainer="Krzysztof Durek <walendes@gmail.com>"
WORKDIR /usr/src/backend
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
COPY package.json yarn.lock tsconfig.json ./
RUN yarn --production=false
COPY prisma ./prisma
RUN yarn prisma generate
COPY . .
RUN yarn build
CMD ["yarn", "start:production"]
