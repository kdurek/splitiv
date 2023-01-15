FROM nginx:stable-alpine
LABEL maintainer="Krzysztof Durek <walendes@gmail.com>"
COPY packages/frontend/dist /usr/share/nginx/html
COPY packages/frontend/nginx.conf /etc/nginx/templates/default.conf.template
CMD ["nginx", "-g", "daemon off;"]
