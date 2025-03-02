
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
    echo "Starting user data script execution at $(date)..."
    
    # Update system packages
    echo "Updating system packages..."
    yum update -y
    
    # Install Amazon Linux extras repository
    echo "Enabling Amazon Linux extras..."
    amazon-linux-extras enable nginx1
    
    # Install required packages with explicit confirmation on errors
    echo "Installing Nginx, MySQL client, Git..."
    yum install -y nginx mysql git || {
      echo "ERROR: Failed to install packages. Retrying with more details..."
      yum install -y nginx -v || echo "NGINX INSTALLATION FAILED"
      yum install -y mysql -v || echo "MYSQL INSTALLATION FAILED"
      yum install -y git -v || echo "GIT INSTALLATION FAILED"
    }
    
    # If Amazon Linux 2, use alternate approach for Nginx
    if [ -f /etc/system-release ] && grep -q "Amazon Linux 2" /etc/system-release; then
      echo "Detected Amazon Linux 2, using alternative Nginx installation..."
      amazon-linux-extras install -y nginx1
    fi
    
    # Double-check Nginx installation
    echo "Verifying Nginx installation..."
    yum list installed | grep nginx
    which nginx || {
      echo "Nginx not found after installation attempt. Trying alternative installation..."
      amazon-linux-extras list
      amazon-linux-extras install -y nginx1
      yum install -y nginx
    }
    
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
    
    # Create Nginx configuration directory if it doesn't exist
    echo "Ensuring Nginx configuration directories exist..."
    mkdir -p /etc/nginx/conf.d
    
    # Start and enable Nginx
    echo "Starting Nginx service..."
    systemctl start nginx || {
      echo "Failed to start Nginx. Checking status..."
      systemctl status nginx
      echo "Checking if Nginx executable exists..."
      ls -la /usr/sbin/nginx || echo "Nginx binary not found"
      echo "Checking Nginx configuration..."
      nginx -t || echo "Nginx configuration test failed"
      echo "Retrying Nginx start..."
      systemctl restart nginx
    }
    
    systemctl enable nginx
    
    # Create a service file if it doesn't exist (useful on some Amazon Linux versions)
    if [ ! -f /usr/lib/systemd/system/nginx.service ]; then
      echo "Creating Nginx service file..."
      cat > /usr/lib/systemd/system/nginx.service <<EOSVC
[Unit]
Description=The NGINX HTTP and reverse proxy server
After=network.target remote-fs.target nss-lookup.target

[Service]
Type=forking
PIDFile=/run/nginx.pid
ExecStartPre=/usr/sbin/nginx -t
ExecStart=/usr/sbin/nginx
ExecReload=/bin/kill -s HUP $MAINPID
KillSignal=SIGQUIT
TimeoutStopSec=5
KillMode=mixed
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOSVC
      systemctl daemon-reload
      systemctl start nginx
      systemctl enable nginx
    fi
    
    # Verify Nginx is listening on port 80
    echo "Verifying Nginx is listening on port 80..."
    ss -tunlp | grep :80 || {
      echo "Nginx is not listening on port 80! Troubleshooting..."
      echo "Checking Nginx configuration:"
      nginx -t
      echo "Checking Nginx error log:"
      tail -n 50 /var/log/nginx/error.log || echo "No Nginx error log found"
      
      # Try to restart Nginx
      echo "Attempting to restart Nginx..."
      systemctl restart nginx
      sleep 5
      ss -tunlp | grep :80 || echo "Still not listening after restart"
    }
    
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
    rm -f /etc/nginx/conf.d/default.conf || true
    
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
    chown -R nginx:nginx /var/www/html || echo "Nginx user not found, permissions not changed"
    
    # Restart Nginx to apply config
    echo "Restarting Nginx to apply configuration..."
    nginx -t && systemctl restart nginx || {
      echo "Nginx config test failed. Checking details..."
      cat /etc/nginx/conf.d/hr-portal.conf
      echo "Default Nginx config:"
      cat /etc/nginx/nginx.conf || echo "nginx.conf not found"
      echo "Attempting to fix configuration..."
      
      # Create a minimal working nginx.conf if needed
      if [ ! -f /etc/nginx/nginx.conf ] || ! nginx -t; then
        echo "Creating minimal working nginx.conf..."
        cat > /etc/nginx/nginx.conf <<EONGINX
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log;
pid /run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    log_format  main  '\$remote_addr - \$remote_user [\$time_local] "\$request" '
                      '\$status \$body_bytes_sent "\$http_referer" '
                      '"\$http_user_agent" "\$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile            on;
    tcp_nopush          on;
    tcp_nodelay         on;
    keepalive_timeout   65;
    types_hash_max_size 2048;

    include             /etc/nginx/mime.types;
    default_type        application/octet-stream;

    include /etc/nginx/conf.d/*.conf;
}
EONGINX
        systemctl restart nginx
      fi
    }
    
    # Verify Nginx is running after restart
    echo "Verifying Nginx status after restart..."
    systemctl status nginx
    ss -tunlp | grep :80
    curl -s http://localhost/ | head
    
    # Signal that the instance is ready for SSM commands
    echo "Marking instance as ready for SSM commands..."
    touch /var/lib/cloud/instance/boot-finished
    
    echo "User data script execution completed successfully at $(date)!"
  EOF

  tags = merge(local.common_tags, {
    Name = "hr-portal-ec2"
  })

  depends_on = [aws_internet_gateway.igw]
}
