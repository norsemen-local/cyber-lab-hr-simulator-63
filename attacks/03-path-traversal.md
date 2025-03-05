
# Path Traversal in File Upload

This document explains how to exploit the path traversal vulnerability in the HR Portal's file upload functionality.

## Overview

The HR Portal application has a vulnerable file upload component that allows users to upload files. This component fails to properly sanitize filenames, allowing for path traversal attacks when downloading files.

## Vulnerability Details

The application uses vulnerable code that doesn't sanitize user input:

```javascript
// Vulnerable code in uploadService.ts
const filename = file.name; // No sanitization
const filePath = UPLOAD_DIR + '/' + filename;

// Later when downloading
link.download = filename; // Unsanitized filename used directly
```

This allows an attacker to specify filenames containing `../` sequences to traverse outside the intended download directory.

## Step-by-Step Exploitation

### 1. Prepare a File with a Path Traversal Sequence

Create a file with a name containing path traversal sequences. For example:

- `../../../etc/passwd`
- `../../../Windows/system.ini`
- `../../config.json`

The file content can be anything you want.

### 2. Upload the File

1. Log in to the HR Portal
2. Navigate to the Document Upload page
3. Select your maliciously named file using the file selector
4. Upload the file

### 3. Verify the Exploitation

After upload, the browser will trigger a download dialog with the malicious filename. On a vulnerable system, this would potentially allow writing files to directories outside the intended upload directory.

The application also displays the path where the file would be saved. Verify that this path is outside the intended uploads directory.

### 4. What This Demonstrates

In a real-world scenario, this type of vulnerability could allow:

1. Overwriting important system files
2. Creating backdoors or webshells in accessible locations
3. Accessing sensitive configuration files

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
