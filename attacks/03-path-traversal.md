
# Path Traversal in File Upload

This document explains how to exploit the path traversal vulnerability in the HR Portal's file upload functionality.

## Overview

The HR Portal application has a vulnerable file upload component that allows users to upload files to the server. This component fails to properly sanitize filenames, allowing for path traversal attacks.

## Vulnerability Details

The application uses Node.js's `path.join()` function with unsanitized user input:

```javascript
// Vulnerable code in uploadService.ts
const filename = file.name; // No sanitization
const filePath = path.join(UPLOAD_DIR, filename);
```

This allows an attacker to specify filenames containing `../` sequences to traverse outside the intended upload directory.

## Step-by-Step Exploitation

### 1. Prepare a File with a Path Traversal Sequence

Create a file with a name containing path traversal sequences. For example:

- `../../../tmp/secret.txt`
- `../config/credentials.json`
- `../../app.log`

The file content can be anything you want to write to the target location.

### 2. Upload the File

1. Log in to the HR Portal
2. Navigate to the Document Upload page
3. Select your maliciously named file using the file selector
4. Upload the file

### 3. Verify the Exploitation

After upload, the application will display the path where the file was saved. Verify that this path is outside the intended uploads directory.

### 4. Accessing Successfully Uploaded Files

If you upload a normal file (without path traversal), it will be saved to the `public/uploads` directory and will be accessible via:

```
http://[application-url]/uploads/[filename]
```

The UI will display this URL after upload, and you can click the "Open Public URL" button to access it directly.

## Impact

This vulnerability allows attackers to:

1. Write files to unauthorized locations on the server
2. Potentially overwrite system files
3. Create backdoors or webshells in accessible locations
4. Access sensitive configuration files

## Mitigation

To fix this vulnerability, implement proper filename sanitization:

```javascript
// Safe implementation
const safeFilename = path.basename(file.name).replace(/[^a-zA-Z0-9_.-]/g, '_');
const filePath = path.join(UPLOAD_DIR, safeFilename);
```

Or better yet, generate random filenames:

```javascript
// Even safer implementation
const fileExtension = path.extname(file.name);
const randomFilename = crypto.randomUUID() + fileExtension;
const filePath = path.join(UPLOAD_DIR, randomFilename);
```
