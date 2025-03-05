
# HR Portal Server

This is the server component of the HR Portal application, which intentionally demonstrates security vulnerabilities for educational purposes.

## Security Warning

⚠️ **This server contains intentional security vulnerabilities including path traversal and file upload vulnerabilities. It is for educational purposes only and should not be used in production environments.**

## Prerequisites

- Node.js 14+ and npm
- AWS CLI configured with appropriate permissions (for deployment to EC2)

## Local Development

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. The server will run on http://localhost:3000

## Deployment to EC2

Use the provided deployment script from the project root:

```
chmod +x server/deploy.sh
./server/deploy.sh
```

This will:
1. Package the server code
2. Upload it to the EC2 instance
3. Install Node.js if needed
4. Set up and start the server as a systemd service

## API Endpoints

- `POST /api/upload` - Upload a file (demonstrates path traversal vulnerability)
- `GET /health` - Simple health check

## Vulnerabilities Demonstrated

1. **Path Traversal in File Upload**
   - The server allows uploading files to arbitrary directories
   - Example: Set `uploadPath` to `../etc` to attempt writing outside the upload directory

2. **Web Shell Upload**
   - The server does not properly filter executable file types
   - PHP, JSP, and other executable files can be uploaded

## Testing the Vulnerabilities

To test the path traversal vulnerability:
1. Use the HR Portal UI to upload a file
2. In the network tab of your browser's dev tools, modify the FormData to include `uploadPath=../etc`
3. Observe that the file is saved outside the intended upload directory

To test the web shell vulnerability:
1. Create a simple PHP file with malicious code (e.g., `<?php system($_GET['cmd']); ?>`)
2. Upload this file using the HR Portal UI
3. Observe that the file is accepted and saved, potentially allowing command execution if PHP is installed

## Mitigation

In a production environment, these vulnerabilities should be fixed by:
1. Sanitizing file paths and filenames
2. Validating file types and content
3. Using secure file storage mechanisms
4. Implementing proper authentication and authorization

## License

Internal use only. Not for distribution.
