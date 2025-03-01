
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
