import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { CalendarRange, ChevronRight, MessageSquare, Eye, Star, Clipboard, CheckSquare } from "lucide-react";

interface Review {
  id: number;
  period: string;
  date: string;
  reviewer: string;
  status: 'draft' | 'in-progress' | 'completed' | 'acknowledged';
  overallRating: number;
  strengths: string[];
  improvements: string[];
  managerComments: string;
  selfAssessment: string;
}

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

  const getStatusBadge = (status: Review['status']) => {
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

  const renderStarRating = (rating: number) => {
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

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Performance Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reviews.map((review) => (
              <div 
                key={review.id} 
                className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => handleViewReview(review)}
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
                    {renderStarRating(review.overallRating)}
                  </div>
                  <Button variant="ghost" size="sm" className="ml-auto md:ml-0">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </div>
              </div>
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
            <div className="space-y-6 py-4">
              <div className="flex flex-wrap justify-between items-center">
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">
                    Review Date: {new Date(viewingReview.date).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    Reviewer: {viewingReview.reviewer}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-sm font-medium">Overall Rating:</div>
                  <div className="flex items-center">
                    {renderStarRating(viewingReview.overallRating)}
                    <span className="ml-1 text-sm font-medium">
                      {viewingReview.overallRating.toFixed(1)}/5.0
                    </span>
                  </div>
                </div>
              </div>
              
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
                      {viewingReview.strengths.map((strength, index) => (
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
                      {viewingReview.improvements.map((improvement, index) => (
                        <li key={index} className="text-sm flex">
                          <ChevronRight className="h-4 w-4 text-amber-600 mr-1 flex-shrink-0" />
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2 text-blue-600" />
                    Manager Comments
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <p className="text-sm whitespace-pre-wrap">{viewingReview.managerComments}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2 text-purple-600" />
                    Self Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  {viewingReview.status === 'in-progress' ? (
                    <div className="space-y-4">
                      <Textarea 
                        placeholder="Enter your self assessment here..."
                        className="min-h-[150px]"
                        value={selfAssessment}
                        onChange={(e) => setSelfAssessment(e.target.value)}
                      />
                      <div className="flex justify-end space-x-2">
                        <Button 
                          className="bg-purple-600 hover:bg-purple-700"
                          onClick={handleSaveSelfAssessment}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Saving..." : "Save Assessment"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">
                      {viewingReview.selfAssessment || "No self assessment provided."}
                    </p>
                  )}
                </CardContent>
              </Card>
              
              {viewingReview.status !== 'acknowledged' && (
                <div className="flex justify-end">
                  <Button 
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={handleAcknowledgeReview}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Processing..." : "Acknowledge Review"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReviewsTab;
