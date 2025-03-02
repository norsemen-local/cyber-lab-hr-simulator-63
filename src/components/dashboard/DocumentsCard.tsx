
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

const DocumentsCard = () => {
  return (
    <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <FileText className="mr-2 h-5 w-5 text-green-500" />
          Documents
        </CardTitle>
        <CardDescription>Access and manage your documents</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-50 rounded-md p-3 mb-4">
          <p className="text-sm text-center">You have no documents yet.</p>
        </div>
        <Button className="w-full" variant="outline" size="sm">
          Upload Document
        </Button>
      </CardContent>
    </Card>
  );
};

export default DocumentsCard;
