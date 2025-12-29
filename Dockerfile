# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1.3.4-alpine AS base
RUN apk add --no-cache curl openssl
WORKDIR /splitiv

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock bunfig.toml /temp/dev/
COPY apps/server/package.json /temp/dev/apps/server/
COPY apps/web/package.json /temp/dev/apps/web/
COPY packages/env/package.json /temp/dev/packages/env/
COPY packages/config/package.json /temp/dev/packages/config/
COPY packages/api/package.json /temp/dev/packages/api/
COPY packages/auth/package.json /temp/dev/packages/auth/
COPY packages/db/package.json /temp/dev/packages/db/
RUN cd /temp/dev && bun install --frozen-lockfile

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lock bunfig.toml /temp/prod/
COPY apps/server/package.json /temp/prod/apps/server/
COPY apps/web/package.json /temp/prod/apps/web/
COPY packages/env/package.json /temp/prod/packages/env/
COPY packages/config/package.json /temp/prod/packages/config/
COPY packages/api/package.json /temp/prod/packages/api/
COPY packages/auth/package.json /temp/prod/packages/auth/
COPY packages/db/package.json /temp/prod/packages/db/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS build
COPY --from=install /temp/dev/node_modules /splitiv/node_modules
COPY --from=install /temp/dev/apps/server/node_modules /splitiv/apps/server/node_modules
COPY --from=install /temp/dev/apps/web/node_modules /splitiv/apps/web/node_modules
COPY --from=install /temp/dev/packages/env/node_modules /splitiv/packages/env/node_modules
COPY --from=install /temp/dev/packages/api/node_modules /splitiv/packages/api/node_modules
COPY --from=install /temp/dev/packages/auth/node_modules /splitiv/packages/auth/node_modules
COPY --from=install /temp/dev/packages/db/node_modules /splitiv/packages/db/node_modules
COPY . .

# tests & build
ENV NODE_ENV=production
ENV DO_NOT_TRACK=1
ARG VITE_SERVER_URL
ENV VITE_SERVER_URL=$VITE_SERVER_URL
ARG VITE_BASE_URL
ENV VITE_BASE_URL=$VITE_BASE_URL
ARG VITE_WEB_PUSH_PUBLIC_KEY
ENV VITE_WEB_PUSH_PUBLIC_KEY=$VITE_WEB_PUSH_PUBLIC_KEY
RUN bun test
RUN bun db:generate
RUN bun run build

# copy production dependencies and source code into server image
FROM base AS server
COPY --from=install /temp/prod/node_modules /splitiv/node_modules
COPY --from=install /temp/prod/apps/server/node_modules /splitiv/apps/server/node_modules
COPY --from=build /splitiv/packages/db/prisma/generated /splitiv/packages/db/prisma/generated
COPY --from=build /splitiv/apps/server/dist /splitiv/apps/server/dist

ENV NODE_ENV=production

USER bun
EXPOSE 3000
ENTRYPOINT [ "bun", "run", "/splitiv/apps/server/dist/index.mjs" ]

FROM nginx:1.29.4-alpine AS web

# Create a non-root user to run nginx
RUN adduser -D -H -u 1001 -s /sbin/nologin webuser

# Copy built assets from build stage
COPY --from=build /splitiv/apps/web/dist /splitiv/apps/web/dist

# Copy nginx config template
COPY --from=build /splitiv/apps/web/nginx.conf /etc/nginx/templates/default.conf.template

# Set correct ownership and permissions
RUN chown -R webuser:webuser /splitiv/apps/web/dist && \
    chmod -R 755 /splitiv/apps/web/dist && \
    # Nginx needs to read and write to these directories
    chown -R webuser:webuser /var/cache/nginx && \
    chown -R webuser:webuser /var/log/nginx && \
    chown -R webuser:webuser /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R webuser:webuser /var/run/nginx.pid && \
    chmod -R 775 /etc/nginx/conf.d


# Tell nginx's template processing which variables to replace
ENV NGINX_ENVSUBST_TEMPLATE_DIR=/etc/nginx/templates
ENV NGINX_ENVSUBST_TEMPLATE_SUFFIX=.template
ENV NGINX_ENVSUBST_OUTPUT_DIR=/etc/nginx/conf.d
ENV PORT=3001

ENV NODE_ENV=production

USER webuser
EXPOSE 3001
CMD ["nginx", "-g", "daemon off;"]
