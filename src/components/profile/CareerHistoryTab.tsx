
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Building, Plus, Trash2, Save, X } from "lucide-react";

export interface CareerEntry {
  id: number;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface CareerHistoryTabProps {
  careerHistory: CareerEntry[];
  onSave: (careerHistory: CareerEntry[]) => void;
}

const CareerHistoryTab = ({
  careerHistory,
  onSave
}: CareerHistoryTabProps) => {
  const [history, setHistory] = useState<CareerEntry[]>(careerHistory);
  const [isAddingExperience, setIsAddingExperience] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newExperience, setNewExperience] = useState<Omit<CareerEntry, 'id'>>({
    company: "",
    position: "",
    startDate: "",
    endDate: "",
    description: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    setHistory(careerHistory);
  }, [careerHistory]);

  const handleNewExperienceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewExperience(prev => ({
      ...prev,
      [id.replace('new-', '')]: value
    }));
  };

  const handleEditExperienceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, id: number) => {
    const { name, value } = e.target;
    setHistory(prev => 
      prev.map(job => 
        job.id === id ? { ...job, [name]: value } : job
      )
    );
  };

  const handleAddExperience = () => {
    if (!newExperience.company || !newExperience.position) {
      toast({
        title: "Missing Information",
        description: "Please provide at least company and position",
        variant: "destructive",
      });
      return;
    }

    const newId = history.length > 0 ? Math.max(...history.map(item => item.id)) + 1 : 1;
    const updatedHistory = [...history, { id: newId, ...newExperience }];
    
    setHistory(updatedHistory);
    onSave(updatedHistory);
    setIsAddingExperience(false);
    setNewExperience({
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      description: ""
    });

    toast({
      title: "Experience Added",
      description: "New career experience has been added",
    });
  };

  const handleDeleteExperience = (id: number) => {
    const updatedHistory = history.filter(job => job.id !== id);
    setHistory(updatedHistory);
    onSave(updatedHistory);
    toast({
      title: "Experience Removed",
      description: "Career experience has been removed",
    });
  };

  const handleStartEditing = (id: number) => {
    setEditingId(id);
  };

  const handleSaveEdit = (id: number) => {
    onSave(history);
    setEditingId(null);
    toast({
      title: "Experience Updated",
      description: "Career experience has been updated",
    });
  };

  const handleCancelEdit = () => {
    setHistory(careerHistory);
    setEditingId(null);
  };

  return (
    <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Career History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {history.map((job) => (
            <div key={job.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
              {editingId === job.id ? (
                // Edit Mode
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`position-${job.id}`}>Position</Label>
                      <Input
                        id={`position-${job.id}`}
                        name="position"
                        value={job.position}
                        onChange={(e) => handleEditExperienceChange(e, job.id)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`company-${job.id}`}>Company</Label>
                      <Input
                        id={`company-${job.id}`}
                        name="company"
                        value={job.company}
                        onChange={(e) => handleEditExperienceChange(e, job.id)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`startDate-${job.id}`}>Start Date</Label>
                      <Input
                        id={`startDate-${job.id}`}
                        name="startDate"
                        value={job.startDate}
                        onChange={(e) => handleEditExperienceChange(e, job.id)}
                        placeholder="e.g., January 2020"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`endDate-${job.id}`}>End Date</Label>
                      <Input
                        id={`endDate-${job.id}`}
                        name="endDate"
                        value={job.endDate}
                        onChange={(e) => handleEditExperienceChange(e, job.id)}
                        placeholder="e.g., Present"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor={`description-${job.id}`}>Description</Label>
                    <Textarea
                      id={`description-${job.id}`}
                      name="description"
                      value={job.description}
                      onChange={(e) => handleEditExperienceChange(e, job.id)}
                      className="h-24"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={handleCancelEdit}
                      className="flex items-center"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                    <Button
                      className="bg-purple-600 hover:bg-purple-700 flex items-center"
                      onClick={() => handleSaveEdit(job.id)}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                // View Mode
                <>
                  <div className="flex justify-between">
                    <h3 className="font-semibold text-lg">{job.position}</h3>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-gray-500 hover:text-purple-700"
                        onClick={() => handleStartEditing(job.id)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500"
                        onClick={() => handleDeleteExperience(job.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <Building className="h-4 w-4 mr-1" />
                    <span>{job.company}</span>
                    <span className="mx-2">•</span>
                    <span>{job.startDate} - {job.endDate}</span>
                  </div>
                  <p className="text-sm">{job.description}</p>
                </>
              )}
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
                  className="flex items-center"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  className="bg-purple-600 hover:bg-purple-700 flex items-center"
                  onClick={handleAddExperience}
                >
                  <Save className="mr-2 h-4 w-4" />
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
