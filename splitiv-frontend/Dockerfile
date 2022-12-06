FROM node:18-alpine as development
LABEL maintainer="Krzysztof Durek <walendes@gmail.com>"
WORKDIR /usr/src/frontend
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}
COPY package.json yarn.lock tsconfig.json ./
RUN yarn
CMD ["yarn", "start:development"]

FROM node:18-alpine as builder
WORKDIR /usr/src/frontend
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ARG VITE_HOST
ENV VITE_HOST=${VITE_HOST}
ARG VITE_PORT
ENV VITE_PORT=${VITE_PORT}
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
ARG VITE_AUTH0_DOMAIN
ENV VITE_AUTH0_DOMAIN=${VITE_AUTH0_DOMAIN}
ARG VITE_AUTH0_CLIENT_ID
ENV VITE_AUTH0_CLIENT_ID=${VITE_AUTH0_CLIENT_ID}
ARG VITE_AUTH0_REDIRECT_URI
ENV VITE_AUTH0_REDIRECT_URI=${VITE_AUTH0_REDIRECT_URI}
ARG VITE_AUTH0_AUDIENCE
ENV VITE_AUTH0_AUDIENCE=${VITE_AUTH0_AUDIENCE}
ARG VITE_AUTH0_SCOPE
ENV VITE_AUTH0_SCOPE=${VITE_AUTH0_SCOPE}
COPY package.json yarn.lock tsconfig.json ./
RUN yarn --production=false
COPY . .
RUN yarn build

FROM nginx:stable-alpine as production
LABEL maintainer="Krzysztof Durek <walendes@gmail.com>"
COPY --from=builder /usr/src/frontend/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/templates/default.conf.template
#COPY nginx.conf /etc/nginx/conf.d/default.conf
CMD ["nginx", "-g", "daemon off;" ]
