
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
    { value: "cmd:ls -la", label: "System Command - List Files (OS Injection)" },
    { value: "cmd:cat /etc/passwd", label: "System Command - User Accounts (OS Injection)" },
    { value: "cmd:whoami", label: "System Command - Current User (OS Injection)" },
    { value: "cmd:env", label: "System Command - Environment Variables (OS Injection)" },
    { value: "/var/www/html/", label: "Web Server Root (Web Shell)" },
    { value: "/proc/self/environ", label: "Container Environment (Breakout)" },
    { value: "/proc/1/cgroup", label: "Container cgroups (Breakout)" },
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

  const isCommandInjection = () => {
    const destinationUrl = showCustomUrl ? customUrl : uploadUrl;
    return destinationUrl.startsWith('cmd:');
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
  
  const isContainerBreakout = () => {
    const destinationUrl = showCustomUrl ? customUrl : uploadUrl;
    return destinationUrl.startsWith('/proc/') || 
           destinationUrl.includes('cgroup') || 
           destinationUrl.includes('environ') ||
           destinationUrl.includes('docker.sock');
  };

  const handleUpload = async () => {
    if (!selectedFile && !isCommandInjection() && !isContainerBreakout()) {
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
      // For command injection or container breakout, we can use a placeholder file if none is selected
      const fileToUpload = selectedFile || new File(["Command Execution Test"], "test-command.txt", { type: "text/plain" });
      
      if (isFileUploadAttack() && isWebShellFile()) {
        toast({
          title: "Security Warning",
          description: `Uploading ${isPHPFile() ? 'PHP' : isJSPFile() ? 'JSP' : 'JavaScript'} files to the web server creates a web shell vulnerability!`,
          variant: "destructive",
        });
      }
      
      const response = await onUpload(fileToUpload, destinationUrl);
      
      setPreviewData({
        content: response.content,
        contentType: response.contentType,
        title: isCommandInjection() ? 'Command Execution Results' : 
               isContainerBreakout() ? 'Container Breakout Attempt' : 
               isFileUploadAttack() && isWebShellFile() ? `Web Shell Upload (${isPHPFile() ? 'PHP' : isJSPFile() ? 'JSP' : 'Node.js'})` : 
               `Preview: ${fileToUpload.name}`,
        isSSRF: false
      });

      if (isCommandInjection()) {
        toast({
          title: "Command Executed",
          description: "OS command executed successfully",
          variant: "destructive",
        });
      } else if (isContainerBreakout()) {
        toast({
          title: "Container Breakout Attempt",
          description: "Attempted to access sensitive container information",
          variant: "destructive",
        });
      } else if (isFileUploadAttack() && isWebShellFile()) {
        toast({
          title: "Web Shell Uploaded",
          description: `${isPHPFile() ? 'PHP' : isJSPFile() ? 'JSP' : 'JavaScript'} web shell uploaded - potential RCE vulnerability`,
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
        description: "An error occurred during upload or command execution",
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
    isCommandInjection,
    isFileUploadAttack,
    isPHPFile,
    isJSPFile,
    isNodeJSFile,
    isWebShellFile,
    isContainerBreakout,
    handleFileChange,
    handleLocationChange,
    handleCustomUrlChange,
    handleUpload,
  };
};
