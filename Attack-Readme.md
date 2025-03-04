
# HR Portal Attack Guide

This document provides a comprehensive guide on exploiting vulnerabilities in the HR Portal application. **This is for educational purposes only** and should only be performed in a controlled environment with explicit authorization.

⚠️ **WARNING: These attacks should only be performed in a controlled environment with proper authorization. Unauthorized testing against systems is illegal and unethical.**

## Attack Vectors

1. [SQL Injection (SQLi)](./attacks/01-sql-injection.md)
2. [Server-Side Request Forgery (SSRF) to Remote Code Execution (RCE)](./attacks/02-ssrf-to-rce.md)
3. [Network Scanning with NMAP](./attacks/03-network-scanning.md)
4. [Exploiting Jenkins for RCE](./attacks/04-jenkins-exploitation.md)
5. [Privilege Escalation Using AWS IAM Permissions](./attacks/05-privilege-escalation.md)

## Attack Flow Summary

1. **Initial Access**: Exploit SQL injection to gain access to the HR Portal
2. **SSRF Exploitation**: Use document upload functionality to perform SSRF attacks
3. **Container Escape**: Upload a web shell and break out of the container
4. **Network Discovery**: Scan internal network to find Jenkins server
5. **Jenkins Exploitation**: Exploit vulnerable Jenkins to gain server access
6. **AWS Credential Theft**: Access EC2 metadata to steal AWS credentials
7. **IAM Privilege Escalation**: Leverage IAM permissions to create admin user

## Prerequisites

- Basic understanding of web security concepts
- Familiarity with Linux command line
- Knowledge of AWS services and IAM
- Basic understanding of Docker and containerization
- Access to penetration testing tools

## Required Tools

- Web browser
- Burp Suite or similar proxy
- NMAP for network scanning
- Metasploit Framework (optional)
- AWS CLI

## Mitigation Recommendations

See our [mitigation recommendations](./attacks/06-mitigation.md) for protecting against these types of attacks.

## Local Testing Environment

This repository includes Docker configurations to set up a vulnerable testing environment locally. To set up:

```bash
# Build and run the vulnerable environment
docker-compose up -d

# Access the HR Portal at http://localhost:8080
```

**Remember:** Always obtain proper authorization before performing security testing against any system.
