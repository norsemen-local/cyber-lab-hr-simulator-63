
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PreviewWindow from "@/components/PreviewWindow";
import DropZone from "./components/DropZone";
import UploadButton from "./components/UploadButton";
import { useDocumentUpload } from "./hooks/useDocumentUpload";
import { isWebShellFile } from "./utils/fileTypeUtils";
import { ExternalLink, Link, Folder, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocumentUploadFormProps {
  onUpload: (file: File, destination: string) => Promise<{ content: string; contentType: string; fileUrl?: string; savedAt?: string }>;
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
          
          <div className="mt-4 flex flex-col space-y-2">
            {previewData.savedAt && (
              <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md mb-2">
                <div className="font-medium mb-1">File Saved To Disk:</div>
                <div className="flex items-center">
                  <Folder className="h-4 w-4 mr-2 text-orange-500" />
                  <span className="break-all">{previewData.savedAt}</span>
                </div>
                <div className="mt-2 text-xs text-amber-600">
                  ⚠️ This is the actual file system path where your file was saved
                </div>
              </div>
            )}
            
            {previewData.fileUrl && (
              <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                <div className="font-medium mb-1 flex items-center">
                  <Globe className="h-4 w-4 mr-2 text-green-600" />
                  Public Access URL:
                </div>
                <div className="flex items-center">
                  <Link className="h-4 w-4 mr-2 text-blue-500" />
                  <a 
                    href={previewData.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline break-all"
                  >
                    {previewData.fileUrl}
                  </a>
                </div>
                <div className="mt-2 text-xs text-green-600">
                  ✓ This URL is publicly accessible!
                </div>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleOpenUrl(previewData.fileUrl)}
                className="bg-blue-50 hover:bg-blue-100 border-blue-200"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Public URL
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentUploadForm;
