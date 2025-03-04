
export type ReviewStatus = 'draft' | 'in-progress' | 'completed' | 'acknowledged';

export interface Review {
  id: number;
  period: string;
  date: string;
  reviewer: string;
  status: ReviewStatus;
  overallRating: number;
  strengths: string[];
  improvements: string[];
  managerComments: string;
  selfAssessment: string;
}
