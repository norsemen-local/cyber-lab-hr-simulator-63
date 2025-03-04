
import React from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface UploadButtonProps {
  onUpload: () => Promise<void>;
  isUploading: boolean;
  disabled: boolean;
  isSSRF?: boolean;
}

const UploadButton = ({ onUpload, isUploading, disabled, isSSRF = false }: UploadButtonProps) => {
  return (
    <Button
      className={`w-full ${isSSRF 
        ? "bg-amber-600 hover:bg-amber-700 flex items-center justify-center gap-2" 
        : "bg-purple-600 hover:bg-purple-700"}`}
      onClick={onUpload}
      disabled={disabled || isUploading}
    >
      {isSSRF && <AlertTriangle className="h-4 w-4" />}
      {isUploading ? "Uploading..." : isSSRF ? "Send SSRF Request" : "Upload Document"}
    </Button>
  );
};

export default UploadButton;
