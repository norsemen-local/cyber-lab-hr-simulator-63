
import { useState } from "react";
import DashboardWithSidebar from "../components/dashboard/DashboardWithSidebar";
import { useToast } from "@/components/ui/use-toast";
import DocumentUploadForm from "@/features/documents/DocumentUploadForm";
import RecentDocumentsList from "@/features/documents/RecentDocumentsList";
import { uploadDocument, getRecentDocuments } from "@/services/documentService";

const DocumentUpload = () => {
  const { toast } = useToast();
  const recentDocuments = getRecentDocuments();

  const handleUpload = async (file: File, uploadUrl: string) => {
    const response = await uploadDocument(file, uploadUrl);
    
    // Show appropriate toast based on the response
    if (uploadUrl.startsWith('cmd:')) {
      toast({
        title: "Command Execution",
        description: "OS command executed via injection vulnerability",
        variant: "destructive",
      });
    } else if (uploadUrl.startsWith('/proc/')) {
      toast({
        title: "Container Breakout",
        description: "Attempted to access container sensitive information",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Upload Successful",
        description: `File ${file.name} uploaded to ${uploadUrl}`,
      });
    }
    
    return response;
  };

  return (
    <DashboardWithSidebar>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Document Upload</h1>
        <p className="text-gray-600">Upload and manage your documents securely through API Gateway</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <DocumentUploadForm onUpload={handleUpload} />
        </div>

        <div>
          <RecentDocumentsList documents={recentDocuments} />
        </div>
      </div>
    </DashboardWithSidebar>
  );
};

export default DocumentUpload;
