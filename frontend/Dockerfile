# ────────────────────────────────────────────────────────────────────────────
# Etapa 1: build — compila el proyecto Vue 3 con Vite
# ────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS build

# Metadatos de la imagen
LABEL stage="build"
LABEL description="Etapa de compilación del frontend Vue 3 / Vite"

WORKDIR /app

# Copiar lockfile primero para aprovechar la caché de capas de Docker.
# Si package.json y package-lock.json no cambian, Docker reutiliza esta capa.
COPY package.json package-lock.json ./

# npm ci instala exactamente las versiones del lockfile (reproducible y más rápido que npm install)
RUN npm ci

# Copiar el resto del código fuente
# (.dockerignore excluye node_modules y dist locales)
COPY . .

# Compilar el proyecto optimizado para producción
RUN npm run build

# ────────────────────────────────────────────────────────────────────────────
# Etapa 2: producción — imagen final mínima con Nginx
# ────────────────────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS production

LABEL maintainer="Deltos — Gestión de Proyectos Académicos"
LABEL description="Frontend Vue 3 — servido por Nginx con proxy al backend"

# Limpiar el contenido por defecto de Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiar SOLO el dist generado en la etapa anterior (sin código fuente ni node_modules)
COPY --from=build /app/dist /usr/share/nginx/html

# Inyectar configuración personalizada de Nginx (routing SPA + proxy al backend)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Nginx escucha en el puerto 80 (mapeado a 8080 en docker-compose)
EXPOSE 80

# Ejecutar Nginx en primer plano (requerido por Docker)
CMD ["nginx", "-g", "daemon off;"]
