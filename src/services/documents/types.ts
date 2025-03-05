
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
}

export interface CommandExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}
