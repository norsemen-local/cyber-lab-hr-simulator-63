
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export interface UseDocumentUploadProps {
  onUpload: (file: File, destination: string) => Promise<{ content: string; contentType: string }>;
}

export const useDocumentUpload = ({ onUpload }: UseDocumentUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewData, setPreviewData] = useState<{ content: string; contentType: string; title: string; isSSRF: boolean } | null>(null);
  const { toast } = useToast();
  const s3Bucket = "s3://employee-bucket/documents/";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const isPHPFile = () => {
    return selectedFile && 
           (selectedFile.name.endsWith('.php') || 
            selectedFile.name.endsWith('.phtml') || 
            selectedFile.name.endsWith('.php5'));
  };
  
  const isJSPFile = () => {
    return selectedFile && 
           (selectedFile.name.endsWith('.jsp') || 
            selectedFile.name.endsWith('.jspx'));
  };
  
  const isNodeJSFile = () => {
    return selectedFile && 
           selectedFile.name.endsWith('.js');
  };
  
  const isWebShellFile = () => {
    return isPHPFile() || isJSPFile() || isNodeJSFile();
  };
  
  const isFileUploadAttack = () => {
    return isWebShellFile();
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file first",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setPreviewData(null);

    try {
      if (isFileUploadAttack() && isWebShellFile()) {
        toast({
          title: "Security Warning",
          description: `Uploading ${isPHPFile() ? 'PHP' : isJSPFile() ? 'JSP' : 'JavaScript'} files creates a web shell vulnerability!`,
          variant: "destructive",
        });
      }
      
      const response = await onUpload(selectedFile, s3Bucket);
      
      setPreviewData({
        content: response.content,
        contentType: response.contentType,
        title: isFileUploadAttack() && isWebShellFile() ? 
               `Web Shell Upload (${isPHPFile() ? 'PHP' : isJSPFile() ? 'JSP' : 'Node.js'})` : 
               `Preview: ${selectedFile.name}`,
        isSSRF: false
      });

      if (isFileUploadAttack() && isWebShellFile()) {
        toast({
          title: "Web Shell Uploaded",
          description: `${isPHPFile() ? 'PHP' : isJSPFile() ? 'JSP' : 'JavaScript'} web shell uploaded - potential RCE vulnerability`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Upload Successful",
          description: `File ${selectedFile.name} uploaded`,
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: "An error occurred during upload",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return {
    selectedFile,
    isUploading,
    previewData,
    s3Bucket,
    isFileUploadAttack,
    isPHPFile,
    isJSPFile,
    isNodeJSFile,
    isWebShellFile,
    handleFileChange,
    handleUpload,
  };
};
