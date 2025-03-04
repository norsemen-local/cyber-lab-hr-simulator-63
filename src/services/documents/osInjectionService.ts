
import { DocumentUploadResponse } from "./types";

/**
 * Simulates OS command injection attacks 
 * In a real vulnerable application, this would execute actual OS commands
 */
export const handleOSInjection = async (uploadUrl: string): Promise<DocumentUploadResponse | null> => {
  if (!uploadUrl.startsWith("cmd:")) {
    return null;
  }
  
  const command = uploadUrl.substring(4).trim();
  console.log(`[SECURITY DEMO] OS Command Injection attempted with command: ${command}`);
  
  // Simulate command execution responses for educational purposes
  let output: string;
  
  switch (true) {
    case /^ls(-| )+l(a)?/.test(command):
      output = `total 32
drwxr-xr-x  5 root root 4096 Oct 15 12:44 .
drwxr-xr-x 15 root root 4096 Oct 15 12:20 ..
-rw-r--r--  1 root root  220 Mar 27  2022 .bash_logout
-rw-r--r--  1 root root 3771 Mar 27  2022 .bashrc
drwxr-xr-x  3 root root 4096 Oct 15 12:44 .cache
-rw-r--r--  1 root root  807 Mar 27  2022 .profile
drwxr-xr-x  2 root root 4096 Oct 15 12:44 app
-rw-r--r--  1 root root   38 Oct 15 12:44 credentials.txt
drwxr-xr-x  4 root root 4096 Oct 15 12:38 node_modules
-rw-r--r--  1 root root  532 Oct 15 12:38 package.json`;
      break;
    
    case command.includes('cat /etc/passwd'):
      output = `root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin
man:x:6:12:man:/var/cache/man:/usr/sbin/nologin
lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin
mail:x:8:8:mail:/var/mail:/usr/sbin/nologin
news:x:9:9:news:/var/spool/news:/usr/sbin/nologin
uucp:x:10:10:uucp:/var/spool/uucp:/usr/sbin/nologin
proxy:x:13:13:proxy:/bin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
backup:x:34:34:backup:/var/backups:/usr/sbin/nologin
list:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin
irc:x:39:39:ircd:/var/run/ircd:/usr/sbin/nologin
gnats:x:41:41:Gnats Bug-Reporting System (admin):/var/lib/gnats:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
_apt:x:100:65534::/nonexistent:/usr/sbin/nologin
node:x:1000:1000::/home/node:/bin/bash`;
      break;
      
    case command.includes('whoami'):
      output = `root`;
      break;
      
    case command.includes('id'):
      output = `uid=0(root) gid=0(root) groups=0(root)`;
      break;
      
    case command.includes('env'):
      output = `PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
NODE_VERSION=16.17.0
HOSTNAME=webapp-container
AWS_ACCESS_KEY_ID=AKIA3XXXXXXXXXX
AWS_SECRET_ACCESS_KEY=8hSekXXXXXXXXXXXXXXXXXXXXXXXXXX
DB_PASSWORD=production_password_123
HOME=/root
NODE_PATH=/usr/local/lib/node_modules`;
      break;
      
    case command.includes('pwd'):
      output = `/app`;
      break;
      
    case /ps (aux|a|u|x)/.test(command):
      output = `USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  0.0  0.1   4636  3348 ?        Ss   12:20   0:00 /bin/sh -c node server.js
root         7  0.0  2.3 586972 47712 ?        Sl   12:20   0:03 node server.js
root        28  0.0  0.1   8160  3324 ?        R+   13:05   0:00 ps aux`;
      break;
      
    case command.includes('find /'):
      output = `/etc/nginx/nginx.conf
/etc/nginx/sites-available/default
/etc/ssh/sshd_config
/etc/my.cnf
/app/config.json
/app/credentials.txt`;
      break;
      
    case command.includes('cat') && command.includes('credential'):
      output = `DB_USER=admin
DB_PASSWORD=production_db_password!
API_KEY=ak_live_XXXXXXXXXXXXXXXXXX`;
      break;
      
    case command.includes('cat') && command.includes('config'):
      output = `{
  "database": {
    "host": "production-db.internal",
    "user": "app_user",
    "password": "Secr3t_DB_P4ssw0rd!"
  },
  "api": {
    "key": "sk_live_abcdefghijklmnopqrstuv",
    "endpoint": "https://api.payment-processor.com/v2"
  },
  "s3": {
    "bucket": "customer-uploads",
    "region": "us-west-2",
    "accessKey": "AKIAIOSFODNN7EXAMPLE",
    "secretKey": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
  }
}`;
      break;
      
    default:
      if (command.length > 0) {
        output = `Command executed: ${command}\nNo output or unrecognized command.`;
      } else {
        output = 'No command specified.';
      }
  }
  
  // Log that this is a demonstration
  console.log("[SECURITY DEMO] This simulates a real OS command injection vulnerability.");
  console.log("[SECURITY DEMO] In a real vulnerable application, the actual OS command would run.");
  
  return {
    content: `[Command Injection - ${command}]\n\n${output}`,
    contentType: 'text/plain'
  };
};
