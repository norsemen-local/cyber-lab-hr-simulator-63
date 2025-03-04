
import React from "react";
import { Button } from "@/components/ui/button";
import ReviewRating from "./ReviewRating";
import ReviewDetailsList from "./ReviewDetailsList";
import ManagerComments from "./ManagerComments";
import SelfAssessment from "./SelfAssessment";
import { Review } from "./types";

interface ReviewDetailsProps {
  review: Review;
  selfAssessment: string;
  onSelfAssessmentChange: (value: string) => void;
  onSaveSelfAssessment: () => void;
  onAcknowledgeReview: () => void;
  isSubmitting: boolean;
}

const ReviewDetails: React.FC<ReviewDetailsProps> = ({
  review,
  selfAssessment,
  onSelfAssessmentChange,
  onSaveSelfAssessment,
  onAcknowledgeReview,
  isSubmitting
}) => {
  return (
    <div className="space-y-6 py-4">
      <div className="flex flex-wrap justify-between items-center">
        <div className="space-y-1">
          <div className="text-sm text-gray-500">
            Review Date: {new Date(review.date).toLocaleDateString()}
          </div>
          <div className="text-sm text-gray-500">
            Reviewer: {review.reviewer}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm font-medium">Overall Rating:</div>
          <div className="flex items-center">
            <ReviewRating rating={review.overallRating} />
            <span className="ml-1 text-sm font-medium">
              {review.overallRating.toFixed(1)}/5.0
            </span>
          </div>
        </div>
      </div>
      
      <ReviewDetailsList 
        strengths={review.strengths} 
        improvements={review.improvements} 
      />
      
      <ManagerComments comments={review.managerComments} />
      
      <SelfAssessment 
        status={review.status}
        selfAssessment={selfAssessment}
        onSelfAssessmentChange={onSelfAssessmentChange}
        onSaveSelfAssessment={onSaveSelfAssessment}
        isSubmitting={isSubmitting}
      />
      
      {review.status !== 'acknowledged' && (
        <div className="flex justify-end">
          <Button 
            className="bg-purple-600 hover:bg-purple-700"
            onClick={onAcknowledgeReview}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Acknowledge Review"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReviewDetails;
