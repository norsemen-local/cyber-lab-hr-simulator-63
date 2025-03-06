
# Use Node.js Alpine image for smaller size
FROM node:18-bullseye

# Set working directory
WORKDIR /app

# Only copy package files first to leverage Docker caching for dependencies
COPY package*.json ./

RUN apt-get update && apt-get install -y \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*
    
# Install dependencies (including dev dependencies needed for build)
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# After build, remove dev dependencies for production
RUN npm prune --omit=dev

# Install a simple HTTP server for serving static content
RUN npm install -g serve

# Ensure database initialization script has execute permissions
RUN chmod +x /app/server/start.sh

# Expose the port the app runs on
EXPOSE 80

# Copy client files to serve statically
RUN mkdir -p /app/server/public
RUN cp -r /app/dist/* /app/server/public/

# Manually create database tables and seed data to ensure it's populated
CMD ["serve", "-s", "dist", "-l", "80"]
