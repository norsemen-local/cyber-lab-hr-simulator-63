
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export interface UseDocumentUploadProps {
  onUpload: (file: File, destination: string) => Promise<{ content: string; contentType: string }>;
}

export const useDocumentUpload = ({ onUpload }: UseDocumentUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadUrl, setUploadUrl] = useState("s3://employee-bucket/documents/");
  const [isUploading, setIsUploading] = useState(false);
  const [previewData, setPreviewData] = useState<{ content: string; contentType: string; title: string; isSSRF: boolean } | null>(null);
  const [customUrl, setCustomUrl] = useState("");
  const [showCustomUrl, setShowCustomUrl] = useState(false);
  const { toast } = useToast();

  const predefinedLocations = [
    { value: "s3://employee-bucket/documents/", label: "Employee Documents" },
    { value: "s3://employee-bucket/reports/", label: "Employee Reports" },
    { value: "s3://hr-data/policies/", label: "HR Policies" },
    { value: "custom", label: "Custom Location" },
    { value: "http://169.254.169.254/latest/meta-data/", label: "Debug - EC2 Metadata (SSRF)" },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleLocationChange = (value: string) => {
    if (value === "custom") {
      setShowCustomUrl(true);
    } else {
      setShowCustomUrl(false);
      setUploadUrl(value);
    }
  };

  const handleCustomUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomUrl(e.target.value);
    setUploadUrl(e.target.value);
  };

  const isSSRFRequest = () => {
    const destinationUrl = showCustomUrl ? customUrl : uploadUrl;
    return destinationUrl.startsWith('http');
  };

  const handleUpload = async () => {
    if (!selectedFile && !isSSRFRequest()) {
      toast({
        title: "Error",
        description: "Please select a file first",
        variant: "destructive",
      });
      return;
    }

    const destinationUrl = showCustomUrl ? customUrl : uploadUrl;
    
    setIsUploading(true);
    setPreviewData(null);

    try {
      // For SSRF requests, we can use a placeholder file if none is selected
      const fileToUpload = selectedFile || new File(["SSRF Request"], "ssrf-request.txt", { type: "text/plain" });
      
      const response = await onUpload(fileToUpload, destinationUrl);
      
      setPreviewData({
        content: response.content,
        contentType: response.contentType,
        title: destinationUrl.startsWith('http') ? 'SSRF Response' : `Preview: ${fileToUpload.name}`,
        isSSRF: destinationUrl.startsWith('http')
      });

      if (destinationUrl.includes("169.254.169.254")) {
        toast({
          title: "SSRF Successful",
          description: "Successfully accessed EC2 metadata",
        });
      } else if (destinationUrl.startsWith('http')) {
        toast({
          title: "SSRF Request Complete",
          description: "Successfully fetched external content",
        });
      } else {
        toast({
          title: "Upload Successful",
          description: `File ${fileToUpload.name} uploaded`,
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: "An error occurred during upload or SSRF request",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return {
    selectedFile,
    uploadUrl,
    isUploading,
    previewData,
    customUrl,
    showCustomUrl,
    predefinedLocations,
    isSSRFRequest,
    handleFileChange,
    handleLocationChange,
    handleCustomUrlChange,
    handleUpload,
  };
};
