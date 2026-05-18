# ────────────────────────────────────────────────────────────────────────────
# Etapa 1: build — compila TypeScript a JavaScript
# ────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS build

LABEL stage="build"
LABEL description="Etapa de compilación del backend Node.js / TypeScript"

WORKDIR /app

# openssl requerido por Prisma en Alpine
RUN apk add --no-cache openssl

# Copiar lockfile primero para aprovechar la caché de capas de Docker
COPY package.json package-lock.json ./

# npm ci instala exactamente las versiones del lockfile (reproducible)
RUN npm ci

# Copiar el resto del código fuente
# (.dockerignore excluye node_modules, dist, uploads, .env, tests)
COPY . .

# Generar Prisma Client para la plataforma del contenedor
RUN npx prisma generate

# Compilar TypeScript → JavaScript en dist/
RUN npm run build

# ────────────────────────────────────────────────────────────────────────────
# Etapa 2: producción — imagen final mínima (solo runtime)
# ────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS production

LABEL maintainer="Deltos — Gestión de Proyectos Académicos"
LABEL description="Backend API REST — Node.js 20 + Express + Prisma"

WORKDIR /app

# Instalar dependencias del sistema operativo necesarias en runtime
# dos2unix: convierte saltos de línea CRLF→LF del script de entrypoint
# openssl:  requerido por Prisma Client en Alpine
RUN apk add --no-cache openssl dos2unix

# Copiar solo package files e instalar dependencias de producción
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copiar solo los artefactos necesarios de la etapa de build
COPY --from=build /app/dist              ./dist
COPY --from=build /app/prisma            ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

# Instalar Prisma CLI globalmente (necesario para prisma db push en entrypoint)
RUN npm install -g prisma

# Crear carpeta de uploads con permisos para el usuario node (no root)
RUN mkdir -p uploads && chown -R node:node uploads

# Copiar y preparar el script de entrada
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN dos2unix /usr/local/bin/docker-entrypoint.sh && \
    chmod +x /usr/local/bin/docker-entrypoint.sh

# Ejecutar como usuario no-root por seguridad
USER node

EXPOSE 3001

ENTRYPOINT ["/bin/sh", "/usr/local/bin/docker-entrypoint.sh"]
CMD ["npm", "start"]
