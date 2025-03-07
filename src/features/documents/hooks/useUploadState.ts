
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export interface PreviewData {
  content: string;
  contentType: string;
  title: string;
  isSSRF: boolean;
  fileUrl?: string;
  savedAt?: string; // Add the savedAt property
}

export const useUploadState = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const { toast } = useToast();

  const setUploadStart = () => {
    setIsUploading(true);
    setPreviewData(null);
  };

  const setUploadComplete = (data: PreviewData) => {
    setPreviewData(data);
    setIsUploading(false);
    
    // Show a toast with file information
    if (data.savedAt) {
      toast({
        title: "Upload Complete",
        description: `File saved to ${data.savedAt}`,
      });
    } else if (data.fileUrl) {
      toast({
        title: "Upload Complete",
        description: "Your file is now accessible via URL",
      });
    }
  };

  const setUploadError = (errorMessage: string) => {
    setIsUploading(false);
    toast({
      title: "Upload Failed",
      description: errorMessage,
      variant: "destructive",
    });
  };

  const showSecurityWarning = (message: string) => {
    toast({
      title: "Security Warning",
      description: message,
      variant: "destructive",
    });
  };

  const showUploadSuccess = (message: string) => {
    toast({
      title: "Upload Successful",
      description: message,
    });
  };

  return {
    isUploading,
    previewData,
    setUploadStart,
    setUploadComplete,
    setUploadError,
    showSecurityWarning,
    showUploadSuccess
  };
};
