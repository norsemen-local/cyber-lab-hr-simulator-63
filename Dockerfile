
# Use Node.js image based on Debian
FROM node:18

# Set working directory
WORKDIR /app

# Install additional system utilities and security tools
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    vim \
    git \
    net-tools \
    iputils-ping \
    dnsutils \
    netcat-openbsd \
    nmap \
    tcpdump \
    procps \
    sudo \
    python3 \
    python3-pip \
    openssh-client \
    jq \
    && apt-get clean

# Create a vulnerable setup for demonstration
RUN mkdir -p /var/www/html && \
    chmod 777 /var/www/html && \
    echo "<html><body><h1>Default Web Page</h1></body></html>" > /var/www/html/index.html

# Install AWS CLI for demonstration
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
    unzip awscliv2.zip && \
    ./aws/install && \
    rm -rf aws awscliv2.zip

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

# Create a dummy AWS credentials file for demonstration
RUN mkdir -p /root/.aws && \
    echo "[default]\naws_access_key_id = AKIAIOSFODNN7EXAMPLE\naws_secret_access_key = wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY\nregion = us-east-1" > /root/.aws/credentials

# Run the application
CMD ["serve", "-s", "dist", "-l", "80"]
