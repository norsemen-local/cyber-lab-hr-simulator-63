
import React from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Upload } from "lucide-react";

interface UploadButtonProps {
  onUpload: () => Promise<void>;
  isUploading: boolean;
  disabled: boolean;
  isSSRF?: boolean;
  isWebShell?: boolean;
}

const UploadButton = ({ 
  onUpload, 
  isUploading, 
  disabled, 
  isSSRF = false, 
  isWebShell = false 
}: UploadButtonProps) => {
  let buttonClasses = "bg-purple-600 hover:bg-purple-700";
  let icon = null;
  let buttonText = "Upload Document";
  
  if (isSSRF) {
    buttonClasses = "bg-amber-600 hover:bg-amber-700 flex items-center justify-center gap-2";
    icon = <AlertTriangle className="h-4 w-4" />;
    buttonText = "Send SSRF Request";
  } else if (isWebShell) {
    buttonClasses = "bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2";
    icon = <AlertTriangle className="h-4 w-4" />;
    buttonText = "Upload Web Shell";
  }
  
  if (isUploading) {
    buttonText = "Uploading...";
  }
  
  return (
    <Button
      className={`w-full ${buttonClasses}`}
      onClick={onUpload}
      disabled={disabled || isUploading}
    >
      {icon}
      {buttonText}
    </Button>
  );
};

export default UploadButton;
