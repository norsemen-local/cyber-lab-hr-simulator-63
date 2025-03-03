
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Shield } from "lucide-react";

interface Document {
  id: number;
  name: string;
  date: string;
  type: string;
}

interface DocumentsTabProps {
  documents: Document[];
}

const DocumentsTab = ({ documents }: DocumentsTabProps) => {
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
                <p className="text-xs text-gray-500">Added: {doc.date}</p>
              </div>
              <Button variant="outline" size="sm">
                View
              </Button>
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex justify-between">
          <Button variant="outline">
            <Shield className="h-4 w-4 mr-2" />
            Privacy Settings
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <FileText className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentsTab;
