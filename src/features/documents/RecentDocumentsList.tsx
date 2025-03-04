
import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Document {
  id: number;
  name: string;
  date: string;
  size: string;
}

interface RecentDocumentsListProps {
  documents: Document[];
}

const RecentDocumentsList = ({ documents }: RecentDocumentsListProps) => {
  return (
    <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg">Recent Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center p-2 rounded-lg hover:bg-gray-50">
              <FileText className="h-5 w-5 text-purple-600 mr-3" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                <p className="text-xs text-gray-500">{doc.date} • {doc.size}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentDocumentsList;
