
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { CheckSquare, Clipboard, ChevronRight } from "lucide-react";

interface ReviewDetailsListProps {
  strengths: string[];
  improvements: string[];
}

const ReviewDetailsList: React.FC<ReviewDetailsListProps> = ({ strengths, improvements }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm flex items-center">
            <CheckSquare className="h-4 w-4 mr-2 text-green-600" />
            Strengths
          </CardTitle>
        </CardHeader>
        <CardContent className="py-2">
          <ul className="space-y-2">
            {strengths.map((strength, index) => (
              <li key={index} className="text-sm flex">
                <ChevronRight className="h-4 w-4 text-green-600 mr-1 flex-shrink-0" />
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm flex items-center">
            <Clipboard className="h-4 w-4 mr-2 text-amber-600" />
            Areas for Improvement
          </CardTitle>
        </CardHeader>
        <CardContent className="py-2">
          <ul className="space-y-2">
            {improvements.map((improvement, index) => (
              <li key={index} className="text-sm flex">
                <ChevronRight className="h-4 w-4 text-amber-600 mr-1 flex-shrink-0" />
                <span>{improvement}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewDetailsList;
