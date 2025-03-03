
# Attack 3: Network Scanning with NMAP

After identifying the Jenkins server, use NMAP to scan for open ports and services.

## Step 1: Install NMAP (if not already installed)

```bash
# On Debian/Ubuntu
sudo apt-get update && sudo apt-get install -y nmap

# On RHEL/CentOS/Amazon Linux
sudo yum install -y nmap
```

## Step 2: Scan the Jenkins Server

```bash
# Scan top ports
nmap -sS -sV $JENKINS_PRIVATE_IP

# Perform more detailed scan on specific ports
nmap -sS -sV -p 8080,22,443,80 $JENKINS_PRIVATE_IP
```

## Step 3: Identify Jenkins Version

Look for service information in the NMAP output. You should see Jenkins 2.32.1 running on port 8080.

Example output:
```
8080/tcp  open  http    Jetty 9.2.z-SNAPSHOT (Jenkins 2.32.1)
```
