
import React from "react";
import DocumentCard from "./DocumentCard";

interface Document {
  id: number;
  name: string;
  date: string;
  type: string;
  content?: string;
  fileUrl?: string;
}

interface DocumentListProps {
  documents: Document[];
  onView: (id: number) => void;
  onOpenFileUrl: (fileUrl?: string) => void;
}

const DocumentList: React.FC<DocumentListProps> = ({ documents, onView, onOpenFileUrl }) => {
  return (
    <div className="space-y-4">
      {documents.map((doc) => (
        <DocumentCard 
          key={doc.id} 
          document={doc} 
          onView={onView} 
          onOpenFileUrl={onOpenFileUrl} 
        />
      ))}
    </div>
  );
};

export default DocumentList;
