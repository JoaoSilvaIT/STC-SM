# syntax=docker/dockerfile:1

# ---- Build stage: produce the static Vite bundle ----
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite inlines these at build time (import.meta.env.*). Defaults assume the app
# is served same-origin behind nginx, which proxies /api and /ws-simulator to
# the backend. Override via docker-compose build args for other hosts/ports.
ARG VITE_API_BASE=""
ARG VITE_WS_URL="ws://localhost:8081/ws-simulator"
RUN printf 'VITE_API_BASE=%s\nVITE_WS_URL=%s\n' "$VITE_API_BASE" "$VITE_WS_URL" > .env.production && \
    npm run build

# ---- Runtime stage: nginx serves the bundle and proxies API + websocket ----
FROM nginx:alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
