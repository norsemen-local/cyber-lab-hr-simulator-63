
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ExternalLink } from "lucide-react";

interface Document {
  id: number;
  name: string;
  date: string;
  type: string;
  content?: string;
  fileUrl?: string;
}

interface DocumentViewerProps {
  document: Document | null;
  onClose: () => void;
  onOpenFileUrl: (fileUrl?: string) => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ document, onClose, onOpenFileUrl }) => {
  if (!document) return null;

  return (
    <Dialog open={!!document} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>{document.name}</DialogTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <div className="border rounded-md p-4 bg-white my-4">
          <div className="text-xs text-gray-500 mb-2">
            Type: {document.type} • Date: {document.date}
            {document.fileUrl && (
              <div className="mt-1">
                File URL: <a 
                  href={document.fileUrl} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {document.fileUrl}
                </a>
              </div>
            )}
          </div>
          
          <div className="whitespace-pre-wrap">
            {document.content}
          </div>
          
          {document.fileUrl && (
            <div className="mt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onOpenFileUrl(document.fileUrl)}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open File URL
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewer;
