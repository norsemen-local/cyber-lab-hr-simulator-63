
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
    { value: "/var/www/html/", label: "Web Server Root (PHP)" },
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
  
  const isFileUploadAttack = () => {
    const destinationUrl = showCustomUrl ? customUrl : uploadUrl;
    return destinationUrl.startsWith('/var/www/html/') || 
           (destinationUrl.startsWith('/') && destinationUrl.includes('www')) ||
           destinationUrl.includes('public_html');
  };

  const isPHPFile = () => {
    return selectedFile && 
           (selectedFile.name.endsWith('.php') || 
            selectedFile.name.endsWith('.phtml') || 
            selectedFile.name.endsWith('.php5'));
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
      // For SSRF requests or file upload attacks, we can use a placeholder file if none is selected
      const fileToUpload = selectedFile || new File(["SSRF Request or File Upload Test"], "test-request.txt", { type: "text/plain" });
      
      if (isFileUploadAttack() && isPHPFile()) {
        toast({
          title: "Security Warning",
          description: "Uploading PHP files to the web server may create a vulnerability!",
          variant: "destructive",
        });
      }
      
      const response = await onUpload(fileToUpload, destinationUrl);
      
      setPreviewData({
        content: response.content,
        contentType: response.contentType,
        title: isSSRFRequest() ? 'SSRF Response' : isFileUploadAttack() ? 'Web Shell Upload' : `Preview: ${fileToUpload.name}`,
        isSSRF: isSSRFRequest()
      });

      if (destinationUrl.includes("169.254.169.254")) {
        toast({
          title: "SSRF Successful",
          description: "Successfully accessed EC2 metadata",
        });
      } else if (isSSRFRequest()) {
        toast({
          title: "SSRF Request Complete",
          description: "Successfully fetched external content",
        });
      } else if (isFileUploadAttack() && isPHPFile()) {
        toast({
          title: "Web Shell Uploaded",
          description: "PHP file uploaded to web server - potential RCE vulnerability",
          variant: "destructive",
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
    isFileUploadAttack,
    isPHPFile,
    handleFileChange,
    handleLocationChange,
    handleCustomUrlChange,
    handleUpload,
  };
};
