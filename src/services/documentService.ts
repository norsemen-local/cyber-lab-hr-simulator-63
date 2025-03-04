
// This is the main entry point that exports all document service functionality
import { DocumentMetadata } from "./documents/types";
import { uploadDocument } from "./documents/uploadService";
import { getRecentDocuments } from "./documents/documentMetadataService";

export { DocumentMetadata, uploadDocument, getRecentDocuments };
