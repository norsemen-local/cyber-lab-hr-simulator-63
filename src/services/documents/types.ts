
// Shared types for document services

export interface DocumentMetadata {
  id: number;
  name: string;
  date: string;
  size: string;
}

export interface DocumentUploadResponse {
  content: string;
  contentType: string;
}
