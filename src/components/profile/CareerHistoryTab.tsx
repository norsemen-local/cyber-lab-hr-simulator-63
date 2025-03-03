
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building, Plus, Trash2 } from "lucide-react";

interface CareerEntry {
  id: number;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface CareerHistoryTabProps {
  careerHistory: CareerEntry[];
  handleDeleteExperience: (id: number) => void;
  handleAddExperience: () => void;
  newExperience: {
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  };
  handleNewExperienceChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  isAddingExperience: boolean;
  setIsAddingExperience: (value: boolean) => void;
}

const CareerHistoryTab = ({
  careerHistory,
  handleDeleteExperience,
  handleAddExperience,
  newExperience,
  handleNewExperienceChange,
  isAddingExperience,
  setIsAddingExperience
}: CareerHistoryTabProps) => {
  return (
    <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Career History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {careerHistory.map((job) => (
            <div key={job.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
              <div className="flex justify-between">
                <h3 className="font-semibold text-lg">{job.position}</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 text-red-500"
                  onClick={() => handleDeleteExperience(job.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <Building className="h-4 w-4 mr-1" />
                <span>{job.company}</span>
                <span className="mx-2">•</span>
                <span>{job.startDate} - {job.endDate}</span>
              </div>
              <p className="text-sm">{job.description}</p>
            </div>
          ))}

          {isAddingExperience && (
            <div className="border-t border-gray-100 pt-6">
              <h3 className="font-semibold text-lg mb-4">Add New Experience</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="new-position">Position</Label>
                  <Input 
                    id="new-position" 
                    value={newExperience.position} 
                    onChange={handleNewExperienceChange} 
                  />
                </div>
                <div>
                  <Label htmlFor="new-company">Company</Label>
                  <Input 
                    id="new-company" 
                    value={newExperience.company} 
                    onChange={handleNewExperienceChange} 
                  />
                </div>
                <div>
                  <Label htmlFor="new-startDate">Start Date</Label>
                  <Input 
                    id="new-startDate" 
                    value={newExperience.startDate} 
                    onChange={handleNewExperienceChange} 
                    placeholder="e.g., January 2020"
                  />
                </div>
                <div>
                  <Label htmlFor="new-endDate">End Date</Label>
                  <Input 
                    id="new-endDate" 
                    value={newExperience.endDate} 
                    onChange={handleNewExperienceChange} 
                    placeholder="e.g., Present"
                  />
                </div>
              </div>
              <div className="mb-4">
                <Label htmlFor="new-description">Description</Label>
                <Textarea 
                  id="new-description" 
                  value={newExperience.description} 
                  onChange={handleNewExperienceChange} 
                  className="h-24" 
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddingExperience(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={handleAddExperience}
                >
                  Save Experience
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {!isAddingExperience && (
          <div className="mt-6">
            <Button 
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => setIsAddingExperience(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Experience
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CareerHistoryTab;
