
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import DocumentList from "./DocumentList";
import DocumentViewer from "./DocumentViewer";
import DocumentUploadForm from "./DocumentUploadForm";

interface Document {
  id: number;
  name: string;
  date: string;
  type: string;
  content?: string;
  fileUrl?: string;
}

interface DocumentsTabProps {
  documents: Document[];
  onUpload: (document: Omit<Document, 'id'>) => void;
  onView: (id: number) => Document | undefined;
}

const DocumentsTab = ({ documents, onUpload, onView }: DocumentsTabProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);
  const { toast } = useToast();

  const handleUpload = (newDocument: Omit<Document, 'id'>) => {
    if (!newDocument.name || !newDocument.content) {
      toast({
        title: "Missing Information",
        description: "Please provide a document name and upload a file",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    
    // Simulate API delay
    setTimeout(() => {
      onUpload({
        name: newDocument.name,
        date: newDocument.date,
        type: newDocument.type,
        content: newDocument.content,
        fileUrl: `https://hrportal.example.com/documents/${newDocument.name}` // Use web URL instead of file path
      });
      
      setIsUploading(false);
      
      toast({
        title: "Document Uploaded",
        description: "Your document has been uploaded successfully"
      });
    }, 1000);
  };

  const handleViewDocument = (id: number) => {
    const document = onView(id);
    if (document) {
      setViewingDocument(document);
    }
  };

  // Handle opening a file in its URL
  const handleOpenFileUrl = (fileUrl?: string) => {
    if (!fileUrl) {
      toast({
        title: "Cannot Open File",
        description: "No URL available for this file",
        variant: "destructive"
      });
      return;
    }

    // In a real app, this would navigate to the file URL
    // For our demo, we'll show the URL in a dialog and simulate navigation
    window.open(fileUrl, '_blank');
    
    toast({
      title: "Opening File URL",
      description: `Navigating to: ${fileUrl}`,
    });
  };

  return (
    <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">My Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <DocumentList 
          documents={documents} 
          onView={handleViewDocument} 
          onOpenFileUrl={handleOpenFileUrl} 
        />
        
        <div className="mt-6 flex justify-between">
          <Button variant="outline">
            <Shield className="h-4 w-4 mr-2" />
            Privacy Settings
          </Button>
          <DocumentUploadForm 
            onUpload={handleUpload} 
            isUploading={isUploading} 
          />
        </div>
        
        <DocumentViewer 
          document={viewingDocument} 
          onClose={() => setViewingDocument(null)}
          onOpenFileUrl={handleOpenFileUrl}
        />
      </CardContent>
    </Card>
  );
};

export default DocumentsTab;
