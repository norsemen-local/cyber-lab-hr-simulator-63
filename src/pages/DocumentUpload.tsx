
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
    try {
      const response = await uploadDocument(file, uploadUrl);
      
      // Check if this is a web shell upload
      if (file.name.endsWith('.php') || file.name.endsWith('.jsp') || file.name.endsWith('.js')) {
        toast({
          title: "Security Warning",
          description: `Uploaded file may be executable and create a web shell vulnerability!`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Upload Successful",
          description: `File ${file.name} uploaded to S3 bucket`,
        });
      }
      
      return response;
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "An error occurred during upload",
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <DashboardWithSidebar>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Document Upload</h1>
        <p className="text-gray-600">Upload and manage your documents in your S3 bucket</p>
      </div>

      {/* Security warning banner for demonstration purposes */}
      <div className="mb-6 p-3 bg-red-50 border border-red-300 rounded-md">
        <h2 className="text-red-800 font-bold flex items-center gap-2">
          <span className="text-red-600 text-lg">⚠️</span> 
          Security Vulnerability Demonstration
        </h2>
        <p className="text-sm text-red-700 mt-1">
          This page contains a file upload vulnerability for educational purposes.
          Uploading executable files like PHP scripts can create web shell vulnerabilities.
        </p>
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
