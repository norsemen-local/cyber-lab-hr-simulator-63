#!/bin/bash

# Script to update only the EC2 instance while preserving other infrastructure
# This improved version checks for existing resources and preserves them

set -e

# Function to log messages
log() {
  echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a aws_hrapp_update.log
}

# Set AWS region
AWS_REGION="us-east-1"
if [ -n "$1" ]; then
  AWS_REGION="$1"
fi

log "🔍 Starting EC2-only update process in region: $AWS_REGION"

# Verify AWS CLI is installed
if ! command -v aws &> /dev/null; then
  log "❌ AWS CLI not found. Please install it first."
  exit 1
fi

# 1. Get information about existing resources
log "🔍 Retrieving information about existing resources..."

# Variables to store resource information
INSTANCE_ID=""
SG_IDS=""
VPC_ID=""
SUBNET_ID=""
IAM_ROLE=""
KEY_PAIR=""
AMI_ID=""
INSTANCE_TYPE=""
TARGET_GROUP_ARN=""

# Check for existing IAM role
log "🔍 Checking for existing IAM role..."
ROLE_EXISTS=$(aws iam get-role --role-name hr-portal-ec2-role --query "Role.RoleName" --output text 2>/dev/null || echo "")
if [ -n "$ROLE_EXISTS" ]; then
  log "✅ Found existing IAM role: $ROLE_EXISTS - will be preserved"
  IAM_ROLE=$ROLE_EXISTS
else
  log "❌ IAM role not found. Cannot proceed without role."
  exit 1
fi

# Check for existing security groups
log "🔍 Checking for existing security groups..."
SG_IDS=$(aws ec2 describe-security-groups --region $AWS_REGION \
  --filters "Name=tag:App,Values=Demo-HR-Application" \
  --query "SecurityGroups[*].GroupId" --output text)

if [ -n "$SG_IDS" ]; then
  log "✅ Found existing security groups: $SG_IDS - will be preserved"
else
  log "❌ Security groups not found. Cannot proceed without security groups."
  exit 1
fi

# Get VPC ID from security groups
VPC_ID=$(aws ec2 describe-security-groups --region $AWS_REGION \
  --group-ids $(echo $SG_IDS | cut -d' ' -f1) \
  --query "SecurityGroups[0].VpcId" --output text)

if [ -n "$VPC_ID" ]; then
  log "✅ Found VPC ID: $VPC_ID - will be preserved"
else
  log "❌ VPC not found. Cannot proceed without VPC."
  exit 1
fi

# Get subnet information
log "🔍 Checking for existing subnets..."
SUBNET_ID=$(aws ec2 describe-subnets --region $AWS_REGION \
  --filters "Name=vpc-id,Values=$VPC_ID" "Name=tag:Name,Values=*public*" \
  --query "Subnets[0].SubnetId" --output text)

if [ -n "$SUBNET_ID" ] && [ "$SUBNET_ID" != "None" ]; then
  log "✅ Found subnet: $SUBNET_ID - will be preserved"
else
  # Try to find any subnet in the VPC
  SUBNET_ID=$(aws ec2 describe-subnets --region $AWS_REGION \
    --filters "Name=vpc-id,Values=$VPC_ID" \
    --query "Subnets[0].SubnetId" --output text)

  if [ -n "$SUBNET_ID" ] && [ "$SUBNET_ID" != "None" ]; then
    log "✅ Found subnet: $SUBNET_ID - will be preserved"
  else
    log "❌ Subnet not found. Cannot proceed without subnet."
    exit 1
  fi
fi

# Check for existing target group
log "🔍 Checking for existing target group..."
TARGET_GROUP_ARN=$(aws elbv2 describe-target-groups --region $AWS_REGION \
  --names hr-portal-tg 2>/dev/null | jq -r '.TargetGroups[0].TargetGroupArn' 2>/dev/null || echo "")

if [ -n "$TARGET_GROUP_ARN" ] && [ "$TARGET_GROUP_ARN" != "null" ]; then
  log "✅ Found target group: $TARGET_GROUP_ARN - will be preserved"
else
  log "⚠️ Target group not found. Will use direct EC2 access."
fi

# Get information about the current EC2 instance
log "🔍 Checking for existing EC2 instance..."
INSTANCE_INFO=$(aws ec2 describe-instances --region $AWS_REGION \
  --filters "Name=tag:Name,Values=hr-portal-ec2" "Name=instance-state-name,Values=running" \
  --query "Reservations[0].Instances[0]" --output json 2>/dev/null || echo "{}")

if [ "$INSTANCE_INFO" != "{}" ]; then
  INSTANCE_ID=$(echo $INSTANCE_INFO | jq -r '.InstanceId')
  INSTANCE_TYPE=$(echo $INSTANCE_INFO | jq -r '.InstanceType')
  AMI_ID=$(echo $INSTANCE_INFO | jq -r '.ImageId')

  log "✅ Found existing EC2 instance: $INSTANCE_ID (Type: $INSTANCE_TYPE, AMI: $AMI_ID)"
  log "🔄 Will terminate and recreate this instance while preserving other resources"
else
  log "⚠️ No running EC2 instance found with name hr-portal-ec2"

  # Check for stopped instances
  STOPPED_INSTANCE=$(aws ec2 describe-instances --region $AWS_REGION \
    --filters "Name=tag:Name,Values=hr-portal-ec2" "Name=instance-state-name,Values=stopped" \
    --query "Reservations[0].Instances[0].InstanceId" --output text 2>/dev/null || echo "")

  if [ -n "$STOPPED_INSTANCE" ] && [ "$STOPPED_INSTANCE" != "None" ]; then
    INSTANCE_ID=$STOPPED_INSTANCE
    log "✅ Found stopped EC2 instance: $INSTANCE_ID - will terminate and recreate"
  fi
fi

# Use default AMI if not found
if [ -z "$AMI_ID" ] || [ "$AMI_ID" == "null" ]; then
  AMI_ID="ami-0889a44b331db0194"  # Amazon Linux 2
  log "⚠️ Using default AMI ID: $AMI_ID"
fi

# Use default instance type if not found
if [ -z "$INSTANCE_TYPE" ] || [ "$INSTANCE_TYPE" == "null" ]; then
  INSTANCE_TYPE="t2.micro"
  log "⚠️ Using default instance type: $INSTANCE_TYPE"
fi

# 2. Terminate existing instance if found
if [ -n "$INSTANCE_ID" ] && [ "$INSTANCE_ID" != "None" ]; then
  log "🗑️ Terminating existing EC2 instance: $INSTANCE_ID"
  aws ec2 terminate-instances --region $AWS_REGION --instance-ids $INSTANCE_ID

  log "⏳ Waiting for instance to terminate..."
  aws ec2 wait instance-terminated --region $AWS_REGION --instance-ids $INSTANCE_ID
  log "✅ Instance terminated successfully"
else
  log "⚠️ No existing instance to terminate"
fi

# 3. Create a new instance using the preserved resources
log "🚀 Creating new EC2 instance..."

# Create user data script
USER_DATA=$(cat <<EOF
#!/bin/bash
# Install required packages
yum update -y
amazon-linux-extras install -y docker
systemctl start docker
systemctl enable docker
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
./aws/install
# Install SSM Agent
yum install -y amazon-ssm-agent
systemctl enable amazon-ssm-agent
systemctl start amazon-ssm-agent
# Create app directory
mkdir -p /opt/hrApp
chmod -R 777 /opt/hrApp
echo "EC2 instance started: $(date)" > /opt/hrApp/startup.log
EOF
)

# Encode user data to base64
USER_DATA_BASE64=$(echo "$USER_DATA" | base64)

# Create EC2 instance
INSTANCE_RESULT=$(aws ec2 run-instances \
  --region $AWS_REGION \
  --image-id $AMI_ID \
  --instance-type $INSTANCE_TYPE \
  --subnet-id $SUBNET_ID \
  --security-group-ids $SG_IDS \
  --iam-instance-profile Name=$(aws iam list-instance-profiles-for-role --role-name $IAM_ROLE --query "InstanceProfiles[0].InstanceProfileName" --output text) \
  --user-data "$USER_DATA_BASE64" \
  --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=hr-portal-ec2},{Key=App,Value=Demo-HR-Application}]" \
  --output json)

if [ $? -ne 0 ]; then
  log "❌ Failed to create EC2 instance"
  exit 1
fi

NEW_INSTANCE_ID=$(echo $INSTANCE_RESULT | jq -r '.Instances[0].InstanceId')
log "✅ New EC2 instance created: $NEW_INSTANCE_ID"

# 4. Wait for the instance to be running
log "⏳ Waiting for instance to be running..."
aws ec2 wait instance-running --region $AWS_REGION --instance-ids $NEW_INSTANCE_ID
log "✅ Instance is now running"

# 5. Get the new instance's public IP
PUBLIC_IP=$(aws ec2 describe-instances --region $AWS_REGION \
  --instance-ids $NEW_INSTANCE_ID \
  --query "Reservations[0].Instances[0].PublicIpAddress" \
  --output text)

log "✅ New instance public IP: $PUBLIC_IP"

# 6. Register instance with target group if it exists
if [ -n "$TARGET_GROUP_ARN" ] && [ "$TARGET_GROUP_ARN" != "null" ]; then
  log "🔄 Registering instance with target group..."
  aws elbv2 register-targets \
    --region $AWS_REGION \
    --target-group-arn $TARGET_GROUP_ARN \
    --targets Id=$NEW_INSTANCE_ID

  if [ $? -eq 0 ]; then
    log "✅ Instance registered with target group successfully"
  else
    log "⚠️ Failed to register instance with target group"
  fi
else
  log "⚠️ Skipping target group registration (no target group found)"
fi

log "🔍 Checking for existing API Gateway..."
# Extract API Gateway ID - use awk to avoid issues with tab-separated output
API_ID=$(aws apigateway get-rest-apis --region us-east-1  --query "items[?contains(name, 'hr-portal')].id" --output text | awk '{print $1}')

if [ -n "$API_ID" ] && [ "$API_ID" != "None" ]; then
  log "✅ Found API Gateway: $API_ID - will be preserved"
fi


# 7. Output summary
log "✅ EC2-only update completed successfully!"
log "🖥️ New EC2 Instance ID: $NEW_INSTANCE_ID"
log "🌐 Public IP Address: $PUBLIC_IP"
log "🚀 The application should be accessible at http://$PUBLIC_IP once it's fully started"
log "⚠️ Note: It may take a few minutes for the instance to complete initialization"

# Export variables for GitHub Actions
if [ -n "$GITHUB_ENV" ]; then
  echo "EC2_INSTANCE_ID=$NEW_INSTANCE_ID" >> $GITHUB_ENV
  echo "EC2_PUBLIC_IP=$PUBLIC_IP" >> $GITHUB_ENV
fi

exit 0
