
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
    mkdir -p /opt/hrApp
    chmod -R 777 /opt/hrApp
    echo "Created hrApp directory at $(date)" > /opt/hrApp/created.txt
    
    # Update system packages
    echo "Updating system packages..."
    yum update -y
    
    # Install AWS CLI first for SSM registration
    echo "Installing AWS CLI..."
    yum install -y aws-cli
    sudo yum install -y https://s3.amazonaws.com/ec2-downloads-windows/SSMAgent/latest/linux_amd64/amazon-ssm-agent.rpm
    # Configure AWS CLI with the instance region
    echo "Configuring AWS CLI default region..."
    mkdir -p /root/.aws
    cat > /root/.aws/config <<EOL
    [default]
    region = us-east-1
    EOL
    
    # Install and start SSM Agent with special care
    echo "Installing and configuring SSM Agent..."
    yum install -y amazon-ssm-agent
    
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
    
    # Install additional development tools
    echo "Installing development tools..."
    yum groupinstall -y "Development Tools"
    

    # Create a file to indicate script completion
    echo "User data script execution completed successfully at $(date)!" > /tmp/user-data-complete.txt
  EOF

  tags = merge(local.common_tags, {
    Name = "hr-portal-ec2"
  })

  depends_on = [aws_internet_gateway.igw]
}
