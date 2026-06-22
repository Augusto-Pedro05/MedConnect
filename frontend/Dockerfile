# =============================================================
# MedConnect Frontend — Multi-Stage Dockerfile
# =============================================================

# ---------- Stage 1: Build ----------
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- Stage 2: Serve with Nginx ----------
FROM nginx:1.27-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 1. Remediação IaC (CKV_DOCKER_3): Instalar libcap e conceder ao binário do Nginx 
#    a autoridade de kernel para abrir a porta 80 mesmo rodando como usuário comum
RUN apk add --no-cache libcap && \
    setcap 'cap_net_bind_service=+ep' /usr/sbin/nginx && \
    chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /var/log/nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# 2. Rebaixa a execução para o usuário nativo 'nginx' (UID 101)
USER nginx

EXPOSE 80

# 3. Remediação IaC (CKV_DOCKER_2): Healthcheck TCP local via Netcat
HEALTHCHECK --interval=30s --timeout=3s \
  CMD nc -z localhost 80 || exit 1

CMD ["nginx", "-g", "daemon off;"]