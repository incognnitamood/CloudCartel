# Stage 1: Build the application
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application (Vite outputs to dist/)
RUN npm run build

# Stage 2: Serve the application
FROM nginx:alpine

# Copy built application from the previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.config /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Health check for Kubernetes
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]