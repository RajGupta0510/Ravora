# Ravora Production Readiness — Dockerfile V1
# Multi-stage build for scaling and security optimization.

# Stage 1: Build Frontend Assets
FROM node:22-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production Runtime
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Copy package descriptors and install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy backend files and built frontend assets
COPY backend/ ./backend/
# backend/ imports the shared HTTP hardening middleware from src/
COPY src/middleware/security.js ./src/middleware/security.js
COPY --from=frontend-builder /app/dist/ ./dist/

# Run as the unprivileged user that ships with the node image
RUN chown -R node:node /app
USER node

# Expose backend REST API / WebSocket port
EXPOSE 10000

# Production Health Check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:10000/api/v1/health || exit 1

# Start production server
CMD ["node", "backend/index.js"]
