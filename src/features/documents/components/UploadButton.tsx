
import React from "react";
import { Button } from "@/components/ui/button";

interface UploadButtonProps {
  onUpload: () => Promise<void>;
  isUploading: boolean;
  disabled: boolean;
}

const UploadButton = ({ onUpload, isUploading, disabled }: UploadButtonProps) => {
  return (
    <Button
      className="w-full bg-purple-600 hover:bg-purple-700"
      onClick={onUpload}
      disabled={disabled || isUploading}
    >
      {isUploading ? "Uploading..." : "Upload Document"}
    </Button>
  );
};

export default UploadButton;
