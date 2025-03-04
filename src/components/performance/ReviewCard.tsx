
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarRange, Eye } from "lucide-react";
import { Review, ReviewStatus } from "./types";
import ReviewRating from "./ReviewRating";

interface ReviewCardProps {
  review: Review;
  onViewReview: (review: Review) => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, onViewReview }) => {
  const getStatusBadge = (status: ReviewStatus) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Draft</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'acknowledged':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">Acknowledged</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div 
      className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
      onClick={() => onViewReview(review)}
    >
      <div className="mb-2 md:mb-0">
        <div className="flex items-start md:items-center md:flex-row flex-col">
          <h3 className="font-medium">{review.period}</h3>
          <div className="md:ml-3 mt-1 md:mt-0">
            {getStatusBadge(review.status)}
          </div>
        </div>
        <div className="flex items-center text-xs text-gray-500 mt-1">
          <CalendarRange className="h-3 w-3 mr-1" />
          <span>{new Date(review.date).toLocaleDateString()}</span>
          <span className="mx-2">•</span>
          <span>Reviewer: {review.reviewer}</span>
        </div>
      </div>
      <div className="flex items-center">
        <div className="mr-4 hidden md:block">
          <ReviewRating rating={review.overallRating} />
        </div>
        <Button variant="ghost" size="sm" className="ml-auto md:ml-0">
          <Eye className="h-4 w-4 mr-2" />
          View
        </Button>
      </div>
    </div>
  );
};

export default ReviewCard;
