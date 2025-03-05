
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload } from "lucide-react";

interface Document {
  name: string;
  date: string;
  type: string;
  content?: string;
}

interface DocumentUploadFormProps {
  onUpload: (document: Document) => void;
  isUploading: boolean;
}

const DocumentUploadForm: React.FC<DocumentUploadFormProps> = ({ onUpload, isUploading }) => {
  const [newDocument, setNewDocument] = useState<Document>({
    name: "",
    date: new Date().toISOString().split('T')[0],
    type: "Work",
    content: ""
  });

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

  const handleUploadClick = () => {
    onUpload(newDocument);
    setNewDocument({
      name: "",
      date: new Date().toISOString().split('T')[0],
      type: "Work",
      content: ""
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </DialogTrigger>
      
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
            onClick={handleUploadClick} 
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
  );
};

export default DocumentUploadForm;
