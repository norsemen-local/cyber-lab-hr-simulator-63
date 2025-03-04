
// This is the main entry point that exports all document service functionality
import { uploadDocument } from "./documents/uploadService";
import { getRecentDocuments } from "./documents/documentMetadataService";
import type { DocumentMetadata } from "./documents/types";

export type { DocumentMetadata };
export { uploadDocument, getRecentDocuments };
