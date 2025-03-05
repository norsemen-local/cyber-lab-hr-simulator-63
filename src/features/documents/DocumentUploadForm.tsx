
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PreviewWindow from "@/components/PreviewWindow";
import DropZone from "./components/DropZone";
import UploadButton from "./components/UploadButton";
import { useDocumentUpload } from "./hooks/useDocumentUpload";

interface DocumentUploadFormProps {
  onUpload: (file: File, destination: string) => Promise<{ content: string; contentType: string }>;
}

const DocumentUploadForm = ({ onUpload }: DocumentUploadFormProps) => {
  const {
    selectedFile,
    isUploading,
    previewData,
    s3Bucket,
    isFileUploadAttack,
    isWebShellFile,
    handleFileChange,
    handleUpload,
  } = useDocumentUpload({ onUpload });

  return (
    <div className="space-y-4">
      <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg">Upload New Document</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <DropZone
              onFileChange={handleFileChange}
              selectedFile={selectedFile}
            />
            
            <div className="text-sm text-gray-500 mb-4">
              Your file will be uploaded to: <span className="font-medium">{s3Bucket}</span>
            </div>
            
            <UploadButton
              onUpload={handleUpload}
              isUploading={isUploading}
              disabled={!selectedFile}
              isWebShell={isFileUploadAttack() && isWebShellFile()}
            />
          </div>
        </CardContent>
      </Card>

      {previewData && (
        <PreviewWindow
          content={previewData.content}
          contentType={previewData.contentType}
          title={previewData.title}
          isSSRF={false}
        />
      )}
    </div>
  );
};

export default DocumentUploadForm;
