
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

# Jenkins EC2 Instance
resource "aws_instance" "jenkins_ec2" {
  ami                    = var.ec2_ami_id
  instance_type          = "t3.medium"  # Medium instance for Jenkins
  subnet_id              = aws_subnet.public_subnet.id
  vpc_security_group_ids = [aws_security_group.jenkins_sg.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2_profile.name

  user_data = <<-EOF
    #!/bin/bash
    # Make sure script runs with proper permissions
    set -ex
    
    # Log all commands for debugging
    exec > >(tee /var/log/user-data.log) 2>&1
    echo "Starting Jenkins setup at $(date)..."
    
    # Update system packages
    yum update -y
    
    # Install Java (required for Jenkins)
    amazon-linux-extras install -y java-openjdk11
    
    # Install and start SSM Agent
    yum install -y amazon-ssm-agent
    systemctl enable amazon-ssm-agent
    systemctl start amazon-ssm-agent
    
    # Install Jenkins 2.32.1 directly (not using Docker)
    echo "Installing Jenkins 2.32.1..."
    wget -O /tmp/jenkins.war https://updates.jenkins.io/download/war/2.32.1/jenkins.war
    
    # Install required dependencies for Jenkins
    yum install -y fontconfig
    
    # Create Jenkins directory structure
    mkdir -p /var/lib/jenkins
    mkdir -p /var/log/jenkins
    
    # Create Jenkins user and set permissions
    useradd -d /var/lib/jenkins jenkins
    chown -R jenkins:jenkins /var/lib/jenkins
    chown -R jenkins:jenkins /var/log/jenkins
    
    # Create systemd service for Jenkins
    cat > /etc/systemd/system/jenkins.service <<EOL
[Unit]
Description=Jenkins Automation Server
After=network.target

[Service]
Type=simple
User=jenkins
ExecStart=/bin/java -Dhudson.model.DirectoryBrowserSupport.CSP= -jar /tmp/jenkins.war --httpPort=8080
Restart=on-failure
Environment="JENKINS_HOME=/var/lib/jenkins"

[Install]
WantedBy=multi-user.target
EOL
    
    # Reload systemd, enable and start Jenkins
    systemctl daemon-reload
    systemctl enable jenkins
    systemctl start jenkins
    
    # Wait for Jenkins to start and then get the initial admin password
    echo "Waiting for Jenkins to start..."
    sleep 30
    
    # Save the initial admin password to a file for easy access
    if [ -f /var/lib/jenkins/secrets/initialAdminPassword ]; then
        echo "Initial Jenkins admin password:" > /tmp/jenkins-password.txt
        cat /var/lib/jenkins/secrets/initialAdminPassword >> /tmp/jenkins-password.txt
    else
        echo "Initial admin password file not found - Jenkins may still be starting" > /tmp/jenkins-password.txt
    fi
    
    # Set permissions for ec2-user
    usermod -aG jenkins ec2-user
    
    # Create a file to indicate script completion
    echo "Jenkins 2.32.1 setup completed successfully at $(date)!" > /tmp/jenkins-setup-complete.txt
  EOF

  tags = merge(local.common_tags, {
    Name = "Demo-Jenkins"
  })

  depends_on = [aws_internet_gateway.igw]
}
