
# Use Node.js image based on Debian (not Alpine) to have more system utilities
FROM node:18

# Set working directory
WORKDIR /app

# Install additional system utilities and bash
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    vim \
    git \
    net-tools \
    iputils-ping \
    dnsutils \
    && apt-get clean

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

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
