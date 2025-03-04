
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare } from "lucide-react";
import { ReviewStatus } from "./types";

interface SelfAssessmentProps {
  status: ReviewStatus;
  selfAssessment: string;
  onSelfAssessmentChange?: (value: string) => void;
  onSaveSelfAssessment?: () => void;
  isSubmitting: boolean;
}

const SelfAssessment: React.FC<SelfAssessmentProps> = ({ 
  status,
  selfAssessment,
  onSelfAssessmentChange,
  onSaveSelfAssessment,
  isSubmitting
}) => {
  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-sm flex items-center">
          <MessageSquare className="h-4 w-4 mr-2 text-purple-600" />
          Self Assessment
        </CardTitle>
      </CardHeader>
      <CardContent className="py-2">
        {status === 'in-progress' ? (
          <div className="space-y-4">
            <Textarea 
              placeholder="Enter your self assessment here..."
              className="min-h-[150px]"
              value={selfAssessment}
              onChange={(e) => onSelfAssessmentChange && onSelfAssessmentChange(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <Button 
                className="bg-purple-600 hover:bg-purple-700"
                onClick={onSaveSelfAssessment}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Assessment"}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm whitespace-pre-wrap">
            {selfAssessment || "No self assessment provided."}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default SelfAssessment;
