
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
    set -e
    # Log all commands for debugging
    exec > >(tee /var/log/user-data.log) 2>&1
    echo "Starting user data script execution..."
    
    # Update system packages
    echo "Updating system packages..."
    yum update -y
    
    # Install required packages
    echo "Installing Nginx, MySQL client, Git..."
    yum install -y nginx mysql git
    
    # Verify Nginx installation
    echo "Verifying Nginx installation..."
    which nginx || { echo "Nginx not found"; exit 1; }
    
    # Install and configure SSM Agent
    echo "Installing and configuring SSM Agent..."
    yum install -y amazon-ssm-agent
    systemctl enable amazon-ssm-agent
    systemctl start amazon-ssm-agent
    
    # Check SSM agent status
    echo "Checking SSM agent status..."
    systemctl status amazon-ssm-agent
    
    # Create a file to indicate SSM is ready
    mkdir -p /var/lib/amazon/ssm
    touch /var/lib/amazon/ssm/ssm-agent-initialized
    
    # Ensure /var/www/html directory exists
    echo "Creating web root directory..."
    mkdir -p /var/www/html
    chmod 755 /var/www/html
    
    # Configure SELinux if it's enabled
    echo "Configuring SELinux permissions for web directory..."
    if command -v getenforce &> /dev/null; then
      if [ "$(getenforce)" != "Disabled" ]; then
        restorecon -Rv /var/www/html || true
        setsebool -P httpd_can_network_connect 1 || true
      fi
    fi
    
    # Start and enable Nginx
    echo "Starting Nginx service..."
    systemctl start nginx
    systemctl enable nginx
    systemctl status nginx
    
    # Verify Nginx is listening on port 80
    echo "Verifying Nginx is listening on port 80..."
    ss -tunlp | grep :80 || { echo "Nginx is not listening on port 80!"; systemctl restart nginx; }
    
    # Install Node.js
    echo "Installing Node.js..."
    curl -sL https://rpm.nodesource.com/setup_18.x | bash -
    yum install -y nodejs
    
    # Create YAML config file (deliberately insecure for demo purposes)
    echo "Creating database configuration file..."
    mkdir -p /etc/hr-portal
    cat > /etc/hr-portal/db_config.yaml <<EOL
    db_config:
      username: ${var.db_username}
      password: ${var.db_password}
      host: ${aws_db_instance.hr_portal_db.address}
      port: 3306
      database: hr_portal
    EOL
    
    # Configure Nginx to serve the React app
    echo "Configuring Nginx for the HR Portal..."
    cat > /etc/nginx/conf.d/hr-portal.conf <<EOL
    server {
        listen 80;
        server_name _;
        
        location / {
            root /var/www/html;
            try_files \$uri \$uri/ /index.html;
        }
        
        # This would be a setup for API proxying in a real microservices architecture
        location /api/ {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_cache_bypass \$http_upgrade;
        }
    }
    EOL
    
    # Remove default Nginx configuration if it exists
    echo "Removing default Nginx configuration..."
    rm -f /etc/nginx/conf.d/default.conf
    
    # Create a default index.html file
    echo "Creating default index.html file..."
    cat > /var/www/html/index.html <<EOL
    <!DOCTYPE html>
    <html>
    <head>
        <title>HR Portal - Deployment Success</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh; text-align: center; }
            .container { max-width: 800px; padding: 20px; }
            h1 { color: #3c87c7; }
            p { margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>HR Portal Deployment Success!</h1>
            <p>The infrastructure has been successfully deployed.</p>
            <p>Timestamp: $(date)</p>
        </div>
    </body>
    </html>
    EOL
    
    # Set correct permissions
    echo "Setting file permissions..."
    chmod -R 755 /var/www/html
    chown -R nginx:nginx /var/www/html || true
    
    # Restart Nginx to apply config
    echo "Restarting Nginx to apply configuration..."
    systemctl restart nginx
    
    # Verify Nginx is running after restart
    echo "Verifying Nginx status after restart..."
    systemctl status nginx
    
    # Signal that the instance is ready for SSM commands
    echo "Marking instance as ready for SSM commands..."
    touch /var/lib/cloud/instance/boot-finished
    
    echo "User data script execution completed successfully!"
  EOF

  tags = merge(local.common_tags, {
    Name = "hr-portal-ec2"
  })

  depends_on = [aws_internet_gateway.igw]
}
