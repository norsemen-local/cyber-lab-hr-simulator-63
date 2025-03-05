
// Shared types for document services

export interface DocumentMetadata {
  id: number;
  name: string;
  date: string;
  size: string;
  fileUrl?: string;
}

export interface DocumentUploadResponse {
  content: string;
  contentType: string;
  fileUrl?: string;
  savedAt?: string;  // Added this property to the interface
}

export interface CommandExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}
