FROM node:18-alpine as builder
LABEL maintainer="Krzysztof Durek <walendes@gmail.com>"
WORKDIR /frontend
COPY package.json yarn.lock ./
RUN yarn
COPY . .
RUN yarn build

FROM nginx:stable-alpine
COPY --from=builder /frontend/dist/ /usr/share/nginx/html/
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;" ]
