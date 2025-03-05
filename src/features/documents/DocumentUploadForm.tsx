
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PreviewWindow from "@/components/PreviewWindow";
import DropZone from "./components/DropZone";
import UploadButton from "./components/UploadButton";
import { useDocumentUpload } from "./hooks/useDocumentUpload";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocumentUploadFormProps {
  onUpload: (file: File, destination: string) => Promise<{ content: string; contentType: string; fileUrl?: string }>;
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

  const handleOpenUrl = (url?: string) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

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
        <div>
          <PreviewWindow
            content={previewData.content}
            contentType={previewData.contentType}
            title={previewData.title}
            isSSRF={false}
          />
          
          {previewData.fileUrl && (
            <div className="mt-4 flex flex-col space-y-2">
              <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                <div className="font-medium">File URL:</div>
                <code className="text-xs break-all">{previewData.fileUrl}</code>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                className="w-fit"
                onClick={() => handleOpenUrl(previewData.fileUrl)}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open File URL
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentUploadForm;
