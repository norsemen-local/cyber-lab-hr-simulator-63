
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Review } from "./types";
import ReviewCard from "./ReviewCard";
import ReviewDetails from "./ReviewDetails";

const ReviewsTab = () => {
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: 1,
      period: "2023 Annual Review",
      date: "2023-12-15",
      reviewer: "Sarah Williams",
      status: 'in-progress',
      overallRating: 4,
      strengths: [
        "Technical expertise in React development",
        "Problem-solving skills",
        "Team collaboration"
      ],
      improvements: [
        "Documentation could be more thorough",
        "Consider more delegation of tasks"
      ],
      managerComments: "Alex has shown strong performance this year, particularly in leading the web application redesign project. His technical skills continue to be an asset to the team. Areas to focus on include improving documentation practices and delegating more to junior team members to help with their growth.",
      selfAssessment: ""
    },
    {
      id: 2,
      period: "2022 Annual Review",
      date: "2022-12-10",
      reviewer: "Sarah Williams",
      status: 'completed',
      overallRating: 4.5,
      strengths: [
        "Critical thinking and problem analysis",
        "Knowledge sharing with teammates",
        "Project delivery"
      ],
      improvements: [
        "Work-life balance could be improved",
        "More focus on strategic planning"
      ],
      managerComments: "Alex has had a stellar year with significant contributions to our key projects. His ability to solve complex problems and share knowledge has improved team performance overall. For next year, I'd like to see Alex focus on strategic thinking and maintaining better work-life balance.",
      selfAssessment: "I've focused on improving my technical skills and mentoring junior developers this year. I'm proud of completing the API redesign project ahead of schedule and implementing the new CI/CD pipeline. Areas I want to improve include delegating more effectively and taking more time for skill development."
    }
  ]);

  const [viewingReview, setViewingReview] = useState<Review | null>(null);
  const [selfAssessment, setSelfAssessment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleViewReview = (review: Review) => {
    setViewingReview(review);
    setSelfAssessment(review.selfAssessment);
  };

  const handleSaveSelfAssessment = () => {
    if (!viewingReview) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setReviews(prev => 
        prev.map(review => 
          review.id === viewingReview.id ? { ...review, selfAssessment } : review
        )
      );
      
      setViewingReview(prev => 
        prev ? { ...prev, selfAssessment } : null
      );
      
      setIsSubmitting(false);
    }, 1000);
  };

  const handleAcknowledgeReview = () => {
    if (!viewingReview) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setReviews(prev => 
        prev.map(review => 
          review.id === viewingReview.id ? { ...review, status: 'acknowledged' as const } : review
        )
      );
      
      setViewingReview(prev => 
        prev ? { ...prev, status: 'acknowledged' as const } : null
      );
      
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Performance Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard 
                key={review.id} 
                review={review} 
                onViewReview={handleViewReview} 
              />
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* View Review Dialog */}
      <Dialog open={!!viewingReview} onOpenChange={(open) => {
        if (!open) setViewingReview(null);
      }}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewingReview?.period}</DialogTitle>
          </DialogHeader>
          
          {viewingReview && (
            <ReviewDetails 
              review={viewingReview}
              selfAssessment={selfAssessment}
              onSelfAssessmentChange={setSelfAssessment}
              onSaveSelfAssessment={handleSaveSelfAssessment}
              onAcknowledgeReview={handleAcknowledgeReview}
              isSubmitting={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReviewsTab;
