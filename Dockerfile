
# Use Node.js Alpine image for smaller size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Only copy package files first to leverage Docker caching for dependencies
COPY package*.json ./

# Install dependencies with --omit=dev for production
RUN npm ci --omit=dev

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Install a simple HTTP server for serving static content
RUN npm install -g serve

# Expose the port the app runs on
EXPOSE 80

# Run the application
CMD ["serve", "-s", "dist", "-l", "80"]
