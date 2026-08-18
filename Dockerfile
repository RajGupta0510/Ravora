# Ravora Production Readiness — Dockerfile V1
# Multi-stage build for scaling and security optimization.

# Stage 1: Build Frontend Assets
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production Runtime
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Copy package descriptors and install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy backend files and built frontend assets
COPY backend/ ./backend/
COPY --from=frontend-builder /app/dist/ ./dist/
COPY --from=frontend-builder /app/server.js ./server.js
COPY --from=frontend-builder /app/ravora.db ./ravora.db

# Expose backend REST API / WebSocket port
EXPOSE 10000

# Production Health Check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:10000/api/v1/health || exit 1

# Start production server
CMD ["node", "backend/index.js"]
