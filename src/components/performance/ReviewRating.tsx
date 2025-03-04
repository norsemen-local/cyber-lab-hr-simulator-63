
import React from "react";
import { Star } from "lucide-react";

interface ReviewRatingProps {
  rating: number;
}

const ReviewRating: React.FC<ReviewRatingProps> = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  return (
    <div className="flex">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
      ))}
      {hasHalfStar && (
        <div className="relative">
          <Star className="w-4 h-4 text-yellow-500" />
          <div className="absolute top-0 left-0 w-1/2 overflow-hidden">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          </div>
        </div>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className="w-4 h-4 text-yellow-500" />
      ))}
    </div>
  );
};

export default ReviewRating;
