
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PreviewWindow from "@/components/PreviewWindow";
import DropZone from "./components/DropZone";
import DestinationSelector from "./components/DestinationSelector";
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
    customUrl,
    showCustomUrl,
    predefinedLocations,
    isSSRFRequest,
    isFileUploadAttack,
    isPHPFile,
    isContainerBreakout,
    handleFileChange,
    handleLocationChange,
    handleCustomUrlChange,
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

            <DestinationSelector
              uploadUrl={showCustomUrl ? customUrl : predefinedLocations[0].value}
              customUrl={customUrl}
              showCustomUrl={showCustomUrl}
              predefinedLocations={predefinedLocations}
              onLocationChange={handleLocationChange}
              onCustomUrlChange={handleCustomUrlChange}
            />
            
            <UploadButton
              onUpload={handleUpload}
              isUploading={isUploading}
              disabled={isSSRFRequest() || isFileUploadAttack() ? false : !selectedFile}
              isSSRF={isSSRFRequest()}
              isWebShell={isFileUploadAttack() && isPHPFile()}
              isContainerBreakout={isContainerBreakout()}
            />
          </div>
        </CardContent>
      </Card>

      {previewData && (
        <PreviewWindow
          content={previewData.content}
          contentType={previewData.contentType}
          title={previewData.title}
          isSSRF={previewData.isSSRF}
        />
      )}
    </div>
  );
};

export default DocumentUploadForm;
