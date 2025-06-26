# Multi-stage build for Canvas Builder Frontend
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --no-optional

# Copy source code and environment files
COPY . .

# Copy production environment file
COPY .env.production .env

# Build the app using webpack (most reliable)
RUN npm run build:webpack

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install serve for static file serving
RUN npm install -g serve

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S frontend -u 1001

# Change ownership of files
RUN chown -R frontend:nodejs /app

USER frontend

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Serve the app
CMD ["serve", "-s", "dist", "-l", "3000"]
