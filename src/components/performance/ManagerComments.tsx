
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

interface ManagerCommentsProps {
  comments: string;
}

const ManagerComments: React.FC<ManagerCommentsProps> = ({ comments }) => {
  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-sm flex items-center">
          <MessageSquare className="h-4 w-4 mr-2 text-blue-600" />
          Manager Comments
        </CardTitle>
      </CardHeader>
      <CardContent className="py-2">
        <p className="text-sm whitespace-pre-wrap">{comments}</p>
      </CardContent>
    </Card>
  );
};

export default ManagerComments;
