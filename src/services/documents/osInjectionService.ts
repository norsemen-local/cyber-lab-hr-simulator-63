
import { DocumentUploadResponse, CommandExecutionResult } from "./types";

/**
 * Simulates OS command injection vulnerability
 * In a real server environment, this would execute system commands
 */
export const executeCommand = async (command: string): Promise<CommandExecutionResult> => {
  console.log("Attempting to execute command:", command);
  
  // In a real vulnerable server, this would use something like:
  // const { execSync } = require('child_process');
  // try {
  //   const output = execSync(command).toString();
  //   return { stdout: output, stderr: "", exitCode: 0 };
  // } catch (error) {
  //   return { stdout: "", stderr: error.message, exitCode: error.status };
  // }
  
  // Since we're in a browser environment, we'll simulate command execution
  // with realistic outputs for demonstration purposes
  
  // Simulate common Linux commands
  if (command.startsWith("ls")) {
    return {
      stdout: "config.json\nemployee_data.db\nhr-portal.js\nnode_modules\npackage.json\nserver.js\nwww",
      stderr: "",
      exitCode: 0
    };
  } else if (command.startsWith("cat /etc/passwd")) {
    return {
      stdout: "root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nbin:x:2:2:bin:/bin:/usr/sbin/nologin\nsys:x:3:3:sys:/dev:/usr/sbin/nologin\nsync:x:4:65534:sync:/bin:/bin/sync\ngames:x:5:60:games:/usr/games:/usr/sbin/nologin\nman:x:6:12:man:/var/cache/man:/usr/sbin/nologin\nlp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin\nmail:x:8:8:mail:/var/mail:/usr/sbin/nologin\nnews:x:9:9:news:/var/spool/news:/usr/sbin/nologin\nuucp:x:10:10:uucp:/var/spool/uucp:/usr/sbin/nologin\nproxy:x:13:13:proxy:/bin:/usr/sbin/nologin\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\nbackup:x:34:34:backup:/var/backups:/usr/sbin/nologin\nlist:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin\nirc:x:39:39:ircd:/var/run/ircd:/usr/sbin/nologin\ngnats:x:41:41:Gnats Bug-Reporting System (admin):/var/lib/gnats:/usr/sbin/nologin\nnobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin\nsystemd-network:x:100:102:systemd Network Management,,,:/run/systemd:/usr/sbin/nologin\nsystemd-resolve:x:101:103:systemd Resolver,,,:/run/systemd:/usr/sbin/nologin\nmessagebus:x:102:106::/nonexistent:/usr/sbin/nologin\nsystemd-timesync:x:103:107:systemd Time Synchronization,,,:/run/systemd:/usr/sbin/nologin\nnode:x:1000:1000:Node.js User,,,:/home/node:/bin/bash",
      stderr: "",
      exitCode: 0
    };
  } else if (command.startsWith("whoami")) {
    return {
      stdout: "www-data",
      stderr: "",
      exitCode: 0
    };
  } else if (command.startsWith("id")) {
    return {
      stdout: "uid=33(www-data) gid=33(www-data) groups=33(www-data)",
      stderr: "",
      exitCode: 0
    };
  } else if (command.startsWith("pwd")) {
    return {
      stdout: "/var/www/html",
      stderr: "",
      exitCode: 0
    };
  } else if (command.startsWith("ps")) {
    return {
      stdout: "  PID TTY          TIME CMD\n    1 ?        00:00:01 node\n   10 ?        00:00:00 npm\n   15 ?        00:00:03 node server.js\n   26 ?        00:00:00 ps",
      stderr: "",
      exitCode: 0
    };
  } else if (command.startsWith("env") || command.startsWith("printenv")) {
    return {
      stdout: "NODE_ENV=production\nPORT=3000\nDBHOST=hr-portal-db.internal\nDBUSER=hrapp\nDBPASS=hr@pp-s3cure-p@ssw0rd\nAWS_REGION=us-east-1\nAWS_DEFAULT_REGION=us-east-1\nAPI_KEY=9876543210abcdef\nJWT_SECRET=hrsecret123!@#\nHOME=/var/www\nPATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
      stderr: "",
      exitCode: 0
    };
  } else if (command.includes("find") && command.includes("password")) {
    return {
      stdout: "./config.json\n./database/credentials.txt\n./logs/access.log",
      stderr: "",
      exitCode: 0
    };
  } else if (command.startsWith("cat") && (command.includes("config.json") || command.includes("credentials"))) {
    return {
      stdout: '{\n  "database": {\n    "host": "hr-portal-db.internal",\n    "user": "hrapp",\n    "password": "hr@pp-s3cure-p@ssw0rd",\n    "name": "employee_db"\n  },\n  "aws": {\n    "region": "us-east-1",\n    "accessKey": "AKIA1234567890EXAMPLE",\n    "secretKey": "abcdefghijklmnopqrstuvwxyz1234567890EXKEY"\n  },\n  "server": {\n    "port": 3000\n  }\n}',
      stderr: "",
      exitCode: 0
    };
  } else if (command.includes("uname")) {
    return {
      stdout: "Linux hr-portal-app-server 5.15.0-1031-aws #36-Ubuntu SMP Mon Feb 12 19:06:23 UTC 2023 x86_64 GNU/Linux",
      stderr: "",
      exitCode: 0
    };
  } else if (command.startsWith("netstat") || command.includes("listening")) {
    return {
      stdout: "Active Internet connections (only servers)\nProto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name\ntcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      -\ntcp        0      0 0.0.0.0:3000            0.0.0.0:*               LISTEN      15/node\ntcp        0      0 127.0.0.1:27017         0.0.0.0:*               LISTEN      -",
      stderr: "",
      exitCode: 0
    };
  } else if (command.includes("ifconfig") || command.includes("ip a")) {
    return {
      stdout: "eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n        inet 10.0.4.12  netmask 255.255.255.0  broadcast 10.0.4.255\n        inet6 fe80::216:3eff:fe10:2a68  prefixlen 64  scopeid 0x20<link>\n        ether 00:16:3e:10:2a:68  txqueuelen 1000  (Ethernet)\n        RX packets 1626908  bytes 1241302978 (1.2 GB)\n        RX errors 0  dropped 0  overruns 0  frame 0\n        TX packets 901965  bytes 571903358 (571.9 MB)\n        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0\n\nlo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536\n        inet 127.0.0.1  netmask 255.0.0.0\n        inet6 ::1  prefixlen 128  scopeid 0x10<host>\n        loop  txqueuelen 1000  (Local Loopback)\n        RX packets 10158  bytes 1050700 (1.0 MB)\n        RX errors 0  dropped 0  overruns 0  frame 0\n        TX packets 10158  bytes 1050700 (1.0 MB)\n        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0",
      stderr: "",
      exitCode: 0
    };
  } else {
    // For any other commands, give a generic response
    return {
      stdout: `Command '${command}' executed successfully.`,
      stderr: "",
      exitCode: 0
    };
  }
};

/**
 * Handles OS command injection through the upload URL
 */
export const handleOSInjection = async (uploadUrl: string): Promise<DocumentUploadResponse | null> => {
  // Only handle URLs that look like OS commands
  if (!uploadUrl.startsWith('cmd:')) {
    return null;
  }
  
  // Extract the command from the URL (remove 'cmd:' prefix)
  const command = uploadUrl.substring(4);
  console.log("OS Injection attempt with command:", command);
  
  try {
    // Execute the command
    const result = await executeCommand(command);
    
    // Format the result as a response
    let content = `Command: ${command}\n\n`;
    content += `Exit Code: ${result.exitCode}\n\n`;
    content += "===== STDOUT =====\n";
    content += result.stdout ? result.stdout : "(No output)\n";
    content += "\n===== STDERR =====\n";
    content += result.stderr ? result.stderr : "(No errors)\n";
    
    return {
      content,
      contentType: "text/plain"
    };
  } catch (error) {
    console.error("Command execution failed:", error);
    return {
      content: `Command execution failed: ${error.message}`,
      contentType: "text/plain"
    };
  }
};
