
import React from "react";
import { Button } from "@/components/ui/button";
import { Eye, ExternalLink, FileText } from "lucide-react";

interface Document {
  id: number;
  name: string;
  date: string;
  type: string;
  content?: string;
  fileUrl?: string;
}

interface DocumentCardProps {
  document: Document;
  onView: (id: number) => void;
  onOpenFileUrl: (fileUrl?: string) => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document, onView, onOpenFileUrl }) => {
  return (
    <div className="flex items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
      <FileText className="h-5 w-5 text-purple-600 mr-3" />
      <div className="flex-1">
        <p className="font-medium">{document.name}</p>
        <p className="text-xs text-gray-500">Added: {document.date} • Type: {document.type}</p>
        {document.fileUrl && (
          <p className="text-xs text-blue-500 truncate mt-1">URL: {document.fileUrl}</p>
        )}
      </div>
      <div className="flex gap-2">
        {document.fileUrl && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onOpenFileUrl(document.fileUrl)}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open URL
          </Button>
        )}
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onView(document.id)}
        >
          <Eye className="h-4 w-4 mr-2" />
          View
        </Button>
      </div>
    </div>
  );
};

export default DocumentCard;
