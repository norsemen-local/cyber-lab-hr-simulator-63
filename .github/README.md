
# HR Portal Deployment

This repository contains GitHub Actions workflows and Terraform configurations to deploy the HR Portal application to AWS.

## Architecture

The application is deployed as a microservices architecture with:
- A single EC2 instance running the application
- API Gateway for routing requests
- RDS MySQL database for data storage
- IAM roles and policies for EC2 to SSH into other instances

## Security Notice

**WARNING**: This deployment includes deliberate security vulnerabilities for educational purposes:

1. Database credentials are stored in plaintext YAML files on the server
2. The login page has SQL injection vulnerabilities
3. EC2 instance has permissions to connect to other instances

DO NOT use this deployment pattern for production applications.

## GitHub Actions Secrets

Before deploying, set up the following secrets in your GitHub repository:

- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- `AWS_REGION`: AWS region (e.g., us-east-1)
- `DB_USERNAME`: Database username
- `DB_PASSWORD`: Database password
- `SSH_PRIVATE_KEY`: SSH private key for connecting to the EC2 instance

## Manual Deployment

If you want to deploy manually:

1. Install Terraform
2. Navigate to the terraform directory
3. Run:
   ```
   terraform init
   terraform plan -var="db_username=YOUR_USERNAME" -var="db_password=YOUR_PASSWORD"
   terraform apply -var="db_username=YOUR_USERNAME" -var="db_password=YOUR_PASSWORD"
   ```

## Infrastructure Details

- **EC2**: t3.micro instance running Amazon Linux 2
- **RDS**: MySQL 8.0 on db.t3.micro instance
- **API Gateway**: Regional endpoint with proxy integration to EC2
- **Networking**: Custom VPC with public and private subnets
