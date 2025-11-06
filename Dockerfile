

# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY tsconfig*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY src ./src

# Compilar TypeScript
RUN npm run build

# ============================================
# Stage 2: Production
FROM node:20-alpine AS app

WORKDIR /app

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copiar package files
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production && \
    npm cache clean --force

# Copiar código compilado desde builder
COPY --from=builder /app/dist ./dist

# Cambiar a usuario no-root
USER nodejs

# Exponer puerto
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["node", "dist/application/server.js"]
