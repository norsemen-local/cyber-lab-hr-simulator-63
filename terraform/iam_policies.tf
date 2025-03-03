
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

# IAM Policy for S3 access - Enhanced with more specific permissions for bucket operations
resource "aws_iam_policy" "ec2_s3_policy" {
  name        = "hr-portal-ec2-s3-policy"
  description = "Policy allowing EC2 to access S3 buckets"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid = "AllowS3BucketAccess",
        Action = [
          "s3:GetObject",
          "s3:ListBucket",
          "s3:GetBucketLocation",
          "s3:ListAllMyBuckets"
        ],
        Effect   = "Allow",
        Resource = "*"
      }
    ]
  })

  tags = local.common_tags
}

# Attach policies to role
resource "aws_iam_role_policy_attachment" "ec2_ssh_policy_attachment" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = aws_iam_policy.ec2_ssh_policy.arn
}

resource "aws_iam_role_policy_attachment" "ec2_s3_policy_attachment" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = aws_iam_policy.ec2_s3_policy.arn
}

# For accessing SSM (Session Manager) if needed
resource "aws_iam_role_policy_attachment" "ssm_policy_attachment" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}
