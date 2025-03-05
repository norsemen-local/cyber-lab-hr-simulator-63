
import { useFileSelection } from "./useFileSelection";
import { useUploadState, PreviewData } from "./useUploadState";
import { 
  isWebShellFile, 
  isExecutableFile, 
  getFileTypeLabel 
} from "../utils/fileTypeUtils";

export interface UseDocumentUploadProps {
  onUpload: (file: File, destination: string) => Promise<{ content: string; contentType: string; fileUrl?: string }>;
}

export const useDocumentUpload = ({ onUpload }: UseDocumentUploadProps) => {
  const { selectedFile, handleFileChange, clearSelectedFile } = useFileSelection();
  const {
    isUploading,
    previewData,
    setUploadStart,
    setUploadComplete,
    setUploadError,
    showSecurityWarning,
    showUploadSuccess
  } = useUploadState();
  
  // Configuration values
  const s3Bucket = "s3://employee-bucket/documents/";

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError("Please select a file first");
      return;
    }

    setUploadStart();

    try {
      // Security checks and warnings
      if (isExecutableFile(selectedFile)) {
        const fileType = getFileTypeLabel(selectedFile);
        showSecurityWarning(`Uploading ${fileType} files creates a web shell vulnerability!`);
      }
      
      // Set local file path for upload (simulating S3 path)
      const localFilePath = `/home/user/documents/`;
      const response = await onUpload(selectedFile, localFilePath);
      
      // Create preview data
      const newPreviewData: PreviewData = {
        content: response.content,
        contentType: response.contentType,
        title: isWebShellFile(selectedFile) ? 
              `Web Shell Upload (${getFileTypeLabel(selectedFile)})` : 
              `Preview: ${selectedFile.name}`,
        isSSRF: false,
        fileUrl: response.fileUrl
      };

      setUploadComplete(newPreviewData);

      // Show appropriate message
      if (isWebShellFile(selectedFile)) {
        showSecurityWarning(`${getFileTypeLabel(selectedFile)} web shell uploaded - potential RCE vulnerability`);
      } else {
        showUploadSuccess(`File ${selectedFile.name} uploaded`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError("An error occurred during upload");
    }
  };

  return {
    selectedFile,
    isUploading,
    previewData,
    s3Bucket,
    handleFileChange,
    handleUpload,
    // Still exporting these for backward compatibility, but clients should use the utility functions directly
    isFileUploadAttack: () => isExecutableFile(selectedFile),
    isPHPFile: () => selectedFile && selectedFile.name.endsWith('.php'),
    isJSPFile: () => selectedFile && selectedFile.name.endsWith('.jsp'),
    isNodeJSFile: () => selectedFile && selectedFile.name.endsWith('.js'),
    isWebShellFile: () => isWebShellFile(selectedFile),
  };
};
