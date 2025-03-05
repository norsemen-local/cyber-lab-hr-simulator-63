
#!/bin/bash

# This script deploys the server code to the EC2 instance
# It should be run from the project root directory

# Exit on error
set -e

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "AWS CLI is not installed. Please install it first."
    exit 1
fi

# Get EC2 instance ID from terraform output
echo "Getting EC2 instance ID..."
cd terraform
INSTANCE_ID=$(terraform output -raw instance_id)
cd ..

if [ -z "$INSTANCE_ID" ]; then
    echo "Failed to get instance ID. Make sure the infrastructure is deployed."
    exit 1
fi

echo "Deploying to EC2 instance: $INSTANCE_ID"

# Create a deployment package
echo "Creating deployment package..."
cd server
zip -r ../deployment.zip .
cd ..

# Upload the deployment package to the instance
echo "Uploading deployment package..."
aws ec2-instance-connect send-ssh-public-key \
    --instance-id $INSTANCE_ID \
    --availability-zone us-east-1a \
    --instance-os-user ec2-user \
    --ssh-public-key file://~/.ssh/id_rsa.pub

# Get the instance's public IP address
INSTANCE_IP=$(aws ec2 describe-instances \
    --instance-ids $INSTANCE_ID \
    --query "Reservations[0].Instances[0].PublicIpAddress" \
    --output text)

# SSH to the instance and deploy the code
echo "Deploying code to instance at $INSTANCE_IP..."
scp -o StrictHostKeyChecking=no deployment.zip ec2-user@$INSTANCE_IP:~/

ssh -o StrictHostKeyChecking=no ec2-user@$INSTANCE_IP << 'ENDSSH'
    # Extract deployment package
    mkdir -p ~/hr-server
    unzip -o ~/deployment.zip -d ~/hr-server
    cd ~/hr-server
    
    # Install Node.js if not already installed
    if ! command -v node &> /dev/null; then
        echo "Installing Node.js..."
        curl -sL https://rpm.nodesource.com/setup_16.x | sudo bash -
        sudo yum install -y nodejs
    fi
    
    # Install dependencies
    npm install
    
    # Set up the server as a systemd service
    sudo bash -c 'cat > /etc/systemd/system/hr-server.service << EOF
[Unit]
Description=HR Portal Server
After=network.target

[Service]
ExecStart=/usr/bin/node /home/ec2-user/hr-server/index.js
Restart=always
User=ec2-user
Environment=PORT=80
WorkingDirectory=/home/ec2-user/hr-server

[Install]
WantedBy=multi-user.target
EOF'

    # Reload systemd, enable and start service
    sudo systemctl daemon-reload
    sudo systemctl enable hr-server
    sudo systemctl restart hr-server
    echo "Deployment complete, service started"
ENDSSH

# Clean up
rm deployment.zip

echo "Deployment completed successfully!"
echo "Server should be running at http://$INSTANCE_IP"
