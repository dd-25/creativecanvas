# Multi-stage build for Canvas Builder Backend
FROM node:18-alpine AS builder

WORKDIR /app

# Install system dependencies for native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    musl-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --production=false

# Copy source code and environment files
COPY . .

# Copy production environment file
COPY .env.production .env

# Run prebuild cleanup
RUN npm run prebuild

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install system dependencies for runtime
RUN apk add --no-cache \
    cairo \
    jpeg \
    pango \
    musl \
    giflib \
    pixman \
    pangomm \
    libjpeg-turbo \
    freetype

# Copy built application from builder stage
COPY --from=builder /app .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S backend -u 1001

# Create necessary directories
RUN mkdir -p /app/uploads /app/temp && \
    chown -R backend:nodejs /app

USER backend

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

# Start the application
CMD ["npm", "start"]
