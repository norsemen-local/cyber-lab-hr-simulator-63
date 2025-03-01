
provider "aws" {
  region = var.aws_region
}

# Define common tags to be applied to all resources
locals {
  common_tags = {
    App = "Demo-HR-Application"
    Note = "For security testing"
    Name = "DemoHRApp"
    Link = "https://github.com/SilentProcess87/cyber-lab-hr-simulator"
  }
}

# VPC Configuration
resource "aws_vpc" "hr_portal_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = merge(local.common_tags, {
    Name = "hr-portal-vpc"
  })
}

# Public Subnet
resource "aws_subnet" "public_subnet" {
  vpc_id                  = aws_vpc.hr_portal_vpc.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "${var.aws_region}a"

  tags = merge(local.common_tags, {
    Name = "hr-portal-public-subnet"
  })
}

# Private Subnet for RDS
resource "aws_subnet" "private_subnet_1" {
  vpc_id            = aws_vpc.hr_portal_vpc.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "${var.aws_region}a"

  tags = merge(local.common_tags, {
    Name = "hr-portal-private-subnet-1"
  })
}

# Second Private Subnet for RDS (required for DB subnet group)
resource "aws_subnet" "private_subnet_2" {
  vpc_id            = aws_vpc.hr_portal_vpc.id
  cidr_block        = "10.0.3.0/24"
  availability_zone = "${var.aws_region}b"

  tags = merge(local.common_tags, {
    Name = "hr-portal-private-subnet-2"
  })
}

# Internet Gateway
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.hr_portal_vpc.id

  tags = merge(local.common_tags, {
    Name = "hr-portal-igw"
  })
}

# Route Table for Public Subnet
resource "aws_route_table" "public_route_table" {
  vpc_id = aws_vpc.hr_portal_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = merge(local.common_tags, {
    Name = "hr-portal-public-route-table"
  })
}

# Associate Public Subnet with Route Table
resource "aws_route_table_association" "public_subnet_association" {
  subnet_id      = aws_subnet.public_subnet.id
  route_table_id = aws_route_table.public_route_table.id
}

# Security Group for EC2
resource "aws_security_group" "ec2_sg" {
  name        = "hr-portal-ec2-sg"
  description = "Security group for HR Portal EC2 instance"
  vpc_id      = aws_vpc.hr_portal_vpc.id

  # Allow SSH access
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "SSH access"
  }

  # Allow HTTP access
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP access"
  }

  # Allow HTTPS access
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS access"
  }

  # Allow all outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, {
    Name = "hr-portal-ec2-sg"
  })
}

# Security Group for RDS
resource "aws_security_group" "rds_sg" {
  name        = "hr-portal-rds-sg"
  description = "Security group for HR Portal RDS instance"
  vpc_id      = aws_vpc.hr_portal_vpc.id

  # Allow MySQL access from EC2 security group
  ingress {
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.ec2_sg.id]
    description     = "MySQL access from EC2"
  }

  # Allow all outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, {
    Name = "hr-portal-rds-sg"
  })
}

# RDS Subnet Group
resource "aws_db_subnet_group" "rds_subnet_group" {
  name       = "hr-portal-rds-subnet-group"
  subnet_ids = [aws_subnet.private_subnet_1.id, aws_subnet.private_subnet_2.id]

  tags = merge(local.common_tags, {
    Name = "HR Portal RDS Subnet Group"
  })
}

# RDS MySQL Instance
resource "aws_db_instance" "hr_portal_db" {
  identifier              = "hr-portal-db"
  allocated_storage       = 20
  storage_type            = "gp2"
  engine                  = "mysql"
  engine_version          = "8.0"
  instance_class          = "db.t3.micro"
  db_name                 = "hr_portal"
  username                = var.db_username
  password                = var.db_password
  parameter_group_name    = "default.mysql8.0"
  db_subnet_group_name    = aws_db_subnet_group.rds_subnet_group.name
  vpc_security_group_ids  = [aws_security_group.rds_sg.id]
  skip_final_snapshot     = true
  publicly_accessible     = false
  backup_retention_period = 7
  multi_az                = false

  tags = merge(local.common_tags, {
    Name = "hr-portal-db"
  })
}

# IAM Role for EC2 to connect to other EC2 instances
resource "aws_iam_role" "ec2_role" {
  name = "hr-portal-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = merge(local.common_tags, {
    Name = "hr-portal-ec2-role"
  })
}

# IAM Policy for EC2 to connect to other EC2 instances
resource "aws_iam_policy" "ec2_ssh_policy" {
  name        = "hr-portal-ec2-ssh-policy"
  description = "Policy allowing EC2 to SSH into other instances"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "ec2:DescribeInstances",
          "ec2-instance-connect:SendSSHPublicKey"
        ]
        Effect   = "Allow"
        Resource = "*"
      }
    ]
  })

  tags = local.common_tags
}

# Attach policy to role
resource "aws_iam_role_policy_attachment" "ec2_ssh_policy_attachment" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = aws_iam_policy.ec2_ssh_policy.arn
}

# For accessing SSM (Session Manager) if needed
resource "aws_iam_role_policy_attachment" "ssm_policy_attachment" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# EC2 Instance Profile
resource "aws_iam_instance_profile" "ec2_profile" {
  name = "hr-portal-ec2-profile"
  role = aws_iam_role.ec2_role.name

  tags = local.common_tags
}

# EC2 Instance
resource "aws_instance" "hr_portal_ec2" {
  ami                    = var.ec2_ami_id
  instance_type          = "t3.micro"
  key_name               = var.key_pair_name
  subnet_id              = aws_subnet.public_subnet.id
  vpc_security_group_ids = [aws_security_group.ec2_sg.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2_profile.name

  user_data = <<-EOF
    #!/bin/bash
    yum update -y
    yum install -y nginx mysql git
    
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
  EOF

  tags = merge(local.common_tags, {
    Name = "hr-portal-ec2"
  })

  depends_on = [aws_internet_gateway.igw]
}

# API Gateway
resource "aws_api_gateway_rest_api" "hr_portal_api" {
  name        = "hr-portal-api"
  description = "HR Portal API Gateway"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = local.common_tags
}

# API Gateway Resource
resource "aws_api_gateway_resource" "api_resource" {
  rest_api_id = aws_api_gateway_rest_api.hr_portal_api.id
  parent_id   = aws_api_gateway_rest_api.hr_portal_api.root_resource_id
  path_part   = "api"
}

# API Gateway Method
resource "aws_api_gateway_method" "api_method" {
  rest_api_id   = aws_api_gateway_rest_api.hr_portal_api.id
  resource_id   = aws_api_gateway_resource.api_resource.id
  http_method   = "ANY"
  authorization_type = "NONE"
}

# API Gateway Integration
resource "aws_api_gateway_integration" "api_integration" {
  rest_api_id             = aws_api_gateway_rest_api.hr_portal_api.id
  resource_id             = aws_api_gateway_resource.api_resource.id
  http_method             = aws_api_gateway_method.api_method.http_method
  integration_http_method = "ANY"
  type                    = "HTTP_PROXY"
  uri                     = "http://${aws_instance.hr_portal_ec2.public_ip}:3000/api"
}

# API Gateway Deployment
resource "aws_api_gateway_deployment" "api_deployment" {
  depends_on = [aws_api_gateway_integration.api_integration]

  rest_api_id = aws_api_gateway_rest_api.hr_portal_api.id
  stage_name  = "prod"

  lifecycle {
    create_before_destroy = true
  }

  tags = local.common_tags
}

# Outputs
output "ec2_public_ip" {
  value = aws_instance.hr_portal_ec2.public_ip
}

output "rds_endpoint" {
  value = aws_db_instance.hr_portal_db.address
}

output "api_gateway_url" {
  value = "${aws_api_gateway_deployment.api_deployment.invoke_url}/api"
}
