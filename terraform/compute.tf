
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
    yum update -y
    yum install -y nginx mysql git amazon-ssm-agent
    
    # Start and enable SSM Agent
    systemctl start amazon-ssm-agent
    systemctl enable amazon-ssm-agent
    
    # Start and enable Nginx
    systemctl start nginx
    systemctl enable nginx
    
    # Install Node.js
    curl -sL https://rpm.nodesource.com/setup_18.x | bash -
    yum install -y nodejs
    
    # Create YAML config file (deliberately insecure for demo purposes)
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
    cat > /etc/nginx/conf.d/hr-portal.conf <<EOL
    server {
        listen 80;
        server_name _;
        
        location / {
            root /var/www/html;
            try_files \$uri /index.html;
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
    
    # Restart Nginx to apply config
    systemctl restart nginx
    
    # Signal that the instance is ready for SSM commands
    touch /var/lib/cloud/instance/boot-finished
  EOF

  tags = merge(local.common_tags, {
    Name = "hr-portal-ec2"
  })

  depends_on = [aws_internet_gateway.igw]
}
