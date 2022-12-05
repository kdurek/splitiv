FROM --platform=linux/amd64 node:18-alpine as builder
LABEL maintainer="Krzysztof Durek <walendes@gmail.com>"
WORKDIR /backend
COPY package.json yarn.lock ./
COPY .env ./
RUN yarn
RUN yarn prisma generate
COPY . .
RUN yarn build
EXPOSE 37534
CMD ["node", "./dist/index.js"]
