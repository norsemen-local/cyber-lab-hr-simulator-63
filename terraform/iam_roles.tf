
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

# EC2 Instance Profile
resource "aws_iam_instance_profile" "ec2_profile" {
  name = "hr-portal-ec2-profile"
  role = aws_iam_role.ec2_role.name

  tags = local.common_tags
}
