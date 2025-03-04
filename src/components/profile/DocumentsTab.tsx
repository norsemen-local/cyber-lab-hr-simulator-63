
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Shield, Upload, Eye, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

interface Document {
  id: number;
  name: string;
  date: string;
  type: string;
  content?: string;
}

interface DocumentsTabProps {
  documents: Document[];
  onUpload: (document: Omit<Document, 'id'>) => void;
  onView: (id: number) => Document | undefined;
}

const DocumentsTab = ({ documents, onUpload, onView }: DocumentsTabProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [newDocument, setNewDocument] = useState<Omit<Document, 'id'>>({
    name: "",
    date: new Date().toISOString().split('T')[0],
    type: "Work",
    content: ""
  });
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewDocument(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleTypeChange = (value: string) => {
    setNewDocument(prev => ({
      ...prev,
      type: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target) {
          setNewDocument(prev => ({
            ...prev,
            name: file.name,
            content: event.target.result as string
          }));
        }
      };
      
      reader.readAsText(file);
    }
  };

  const handleUpload = () => {
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
        content: newDocument.content
      });
      
      setIsUploading(false);
      setNewDocument({
        name: "",
        date: new Date().toISOString().split('T')[0],
        type: "Work",
        content: ""
      });
      
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

  return (
    <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">My Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
              <FileText className="h-5 w-5 text-purple-600 mr-3" />
              <div className="flex-1">
                <p className="font-medium">{doc.name}</p>
                <p className="text-xs text-gray-500">Added: {doc.date} • Type: {doc.type}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleViewDocument(doc.id)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
            </div>
          ))}
        </div>
        
        <Dialog>
          <div className="mt-6 flex justify-between">
            <Button variant="outline">
              <Shield className="h-4 w-4 mr-2" />
              Privacy Settings
            </Button>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </DialogTrigger>
          </div>
          
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="document">Upload File</Label>
                <Input 
                  id="document" 
                  type="file" 
                  onChange={handleFileChange}
                />
              </div>
              
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="name">Document Name</Label>
                <Input 
                  id="name" 
                  value={newDocument.name} 
                  onChange={handleInputChange} 
                  placeholder="Enter document name"
                />
              </div>
              
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="date">Document Date</Label>
                <Input 
                  id="date" 
                  type="date" 
                  value={newDocument.date} 
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="type">Document Type</Label>
                <Select value={newDocument.type} onValueChange={handleTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Legal">Legal</SelectItem>
                    <SelectItem value="Work">Work</SelectItem>
                    <SelectItem value="Review">Review</SelectItem>
                    <SelectItem value="Certificate">Certificate</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={handleUpload} 
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={isUploading}
              >
                {isUploading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Document
                  </span>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Document Viewer Dialog */}
        <Dialog open={!!viewingDocument} onOpenChange={(open) => {
          if (!open) setViewingDocument(null);
        }}>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
            <DialogHeader className="flex flex-row items-center justify-between">
              <DialogTitle>{viewingDocument?.name}</DialogTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={() => setViewingDocument(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogHeader>
            <div className="border rounded-md p-4 bg-white my-4">
              <div className="text-xs text-gray-500 mb-2">
                Type: {viewingDocument?.type} • Date: {viewingDocument?.date}
              </div>
              <div className="whitespace-pre-wrap">
                {viewingDocument?.content}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default DocumentsTab;
