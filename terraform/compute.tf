
# EC2 Instance
resource "aws_instance" "hr_portal_ec2" {
  ami                    = var.ec2_ami_id
  instance_type          = "t3.micro"
  # Removing the key_name property
  subnet_id              = aws_subnet.public_subnet.id
  vpc_security_group_ids = [aws_security_group.ec2_sg.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2_profile.name

  user_data = <<-EOF
    #!/bin/bash
    # Make sure script runs with proper permissions
    set -ex
    
    # Log all commands for debugging
    exec > >(tee /var/log/user-data.log) 2>&1
    echo "Starting user data script execution at $(date)..."
    
    # Create a test file to verify script execution
    echo "Script executed at $(date)" > /tmp/script-executed.txt
    
    # Create application directory with explicit permissions
    mkdir -p /tmp/hrApp
    chmod -R 777 /tmp/hrApp
    echo "Created hrApp directory at $(date)" > /tmp/hrApp/created.txt
    
    # Update system packages
    echo "Updating system packages..."
    yum update -y
    
    # Install Docker with robust error handling
    echo "Installing Docker..."
    amazon-linux-extras install -y docker || {
      echo "Failed to install Docker using amazon-linux-extras, trying alternative method..."
      yum install -y docker
    }
    
    # Make sure Docker service is enabled and started with retries
    echo "Enabling and starting Docker service..."
    systemctl enable docker
    
    # Try to start Docker with multiple attempts
    for i in {1..5}; do
      echo "Attempt $i to start Docker service..."
      systemctl start docker && break || {
        echo "Start attempt $i failed, waiting and trying again..."
        sleep 10
      }
    done
    
    # Verify Docker is installed and running
    echo "Verifying Docker installation..."
    docker --version || echo "Docker installation failed!"
    systemctl status docker || echo "Docker service is not running!"
    
    # Add ec2-user to docker group
    usermod -aG docker ec2-user
    
    # Install AWS CLI for S3 access
    echo "Installing AWS CLI..."
    yum install -y aws-cli
    
    # Install additional development tools
    echo "Installing development tools..."
    yum groupinstall -y "Development Tools"
    
    # Install and configure SSM Agent
    echo "Installing and configuring SSM Agent..."
    yum install -y amazon-ssm-agent || echo "SSM agent installation failed, may already be installed"
    systemctl enable amazon-ssm-agent
    systemctl start amazon-ssm-agent
    
    # Check SSM agent status
    echo "Checking SSM agent status..."
    systemctl status amazon-ssm-agent
    
    # Create a file to indicate SSM is ready
    mkdir -p /var/lib/amazon/ssm
    touch /var/lib/amazon/ssm/ssm-agent-initialized
    
    # Create a directory for the application
    echo "Creating application directory..."
    mkdir -p /app
    
    # Create a default HTML page as a placeholder until the Docker container is running
    cat > /app/index.html <<EOL
    <!DOCTYPE html>
    <html>
    <head>
        <title>HR Portal - Docker Setup</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh; text-align: center; }
            .container { max-width: 800px; padding: 20px; }
            h1 { color: #3c87c7; }
            p { margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>HR Portal Docker Setup</h1>
            <p>The Docker infrastructure has been successfully deployed.</p>
            <p>The application container should be starting soon.</p>
            <p>Timestamp: $(date)</p>
        </div>
    </body>
    </html>
    EOL
    
    # Create a simple web server to serve the default page until Docker container is running
    echo "Setting up a temporary web server..."
    yum install -y nginx
    mkdir -p /var/www/html
    cp /app/index.html /var/www/html/
    systemctl enable nginx
    systemctl start nginx
    
    # Signal that the instance is ready for SSM commands
    echo "Marking instance as ready for SSM commands..."
    touch /var/lib/cloud/instance/boot-finished
    
    # Create a healthcheck file that can be used to verify the instance is ready
    echo "Creating health check file..."
    echo "Instance initialized at $(date)" > /var/www/html/health.txt
    
    # Verify Docker installation again and create test container to ensure Docker works
    echo "Creating a test Docker container to verify Docker works..."
    docker run --rm hello-world || echo "Docker test container failed to run!"
    
    # Create a Docker test file to verify Docker is working
    echo "Creating Docker test file..."
    echo "Docker status: $(docker --version 2>&1)" > /var/www/html/docker-status.txt
    echo "Service status: $(systemctl status docker 2>&1)" >> /var/www/html/docker-status.txt
    echo "Test container: $(docker run --rm hello-world 2>&1)" >> /var/www/html/docker-status.txt
    
    # Configure AWS CLI with the instance region
    echo "Configuring AWS CLI default region..."
    mkdir -p /root/.aws
    cat > /root/.aws/config <<EOL
    [default]
    region = us-east-1
    EOL
    
    # Create a file to indicate script completion
    echo "User data script execution completed successfully at $(date)!" > /tmp/user-data-complete.txt
  EOF

  tags = merge(local.common_tags, {
    Name = "hr-portal-ec2"
  })

  depends_on = [aws_internet_gateway.igw]
}
