
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Check, X, Target, Calendar, Trophy, Clock, BarChart3 } from "lucide-react";

interface Goal {
  id: number;
  title: string;
  description: string;
  category: string;
  dueDate: string;
  progress: number;
  status: 'not-started' | 'in-progress' | 'completed';
}

const GoalsTab = () => {
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: 1,
      title: "Complete Advanced React Training",
      description: "Finish the advanced React course on Udemy and apply knowledge to current projects.",
      category: "Learning",
      dueDate: "2023-12-31",
      progress: 60,
      status: 'in-progress'
    },
    {
      id: 2,
      title: "Improve Code Quality Metrics",
      description: "Reduce technical debt by 15% and increase test coverage to 80%.",
      category: "Technical",
      dueDate: "2023-11-15",
      progress: 45,
      status: 'in-progress'
    },
    {
      id: 3,
      title: "Mentor Junior Developer",
      description: "Provide weekly mentoring sessions to help junior team member develop skills.",
      category: "Leadership",
      dueDate: "2023-12-15",
      progress: 75,
      status: 'in-progress'
    }
  ]);

  const [newGoal, setNewGoal] = useState<Omit<Goal, 'id' | 'progress' | 'status'>>({
    title: "",
    description: "",
    category: "Technical",
    dueDate: new Date().toISOString().split('T')[0]
  });

  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewGoal(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleCategoryChange = (value: string) => {
    setNewGoal(prev => ({
      ...prev,
      category: value
    }));
  };

  const handleAddGoal = () => {
    if (!newGoal.title) {
      toast({
        title: "Missing Information",
        description: "Please provide a goal title",
        variant: "destructive"
      });
      return;
    }

    const newId = goals.length > 0 ? Math.max(...goals.map(goal => goal.id)) + 1 : 1;
    const updatedGoals = [...goals, {
      id: newId,
      ...newGoal,
      progress: 0,
      status: 'not-started' as const
    }];
    
    setGoals(updatedGoals);
    setNewGoal({
      title: "",
      description: "",
      category: "Technical",
      dueDate: new Date().toISOString().split('T')[0]
    });
    setIsAddingGoal(false);
    
    toast({
      title: "Goal Added",
      description: "New goal has been created successfully"
    });
  };

  const handleUpdateProgress = (id: number, newProgress: number) => {
    setGoals(prev => 
      prev.map(goal => {
        if (goal.id === id) {
          const status = 
            newProgress === 100 ? 'completed' as const : 
            newProgress === 0 ? 'not-started' as const : 
            'in-progress' as const;
          
          return { ...goal, progress: newProgress, status };
        }
        return goal;
      })
    );

    toast({
      title: "Progress Updated",
      description: `Goal progress updated to ${newProgress}%`
    });
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
  };

  const handleUpdateGoal = () => {
    if (!editingGoal) return;

    setGoals(prev => 
      prev.map(goal => 
        goal.id === editingGoal.id ? editingGoal : goal
      )
    );
    
    setEditingGoal(null);
    
    toast({
      title: "Goal Updated",
      description: "Your goal has been updated successfully"
    });
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editingGoal) return;
    
    const { id, value } = e.target;
    setEditingGoal(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [id.replace('edit-', '')]: value
      };
    });
  };

  const handleEditCategoryChange = (value: string) => {
    if (!editingGoal) return;
    
    setEditingGoal(prev => {
      if (!prev) return null;
      return {
        ...prev,
        category: value
      };
    });
  };

  const getStatusColor = (status: Goal['status']) => {
    switch (status) {
      case 'not-started':
        return "text-gray-500";
      case 'in-progress':
        return "text-blue-500";
      case 'completed':
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Technical':
        return <BarChart3 className="h-4 w-4 mr-2" />;
      case 'Learning':
        return <Clock className="h-4 w-4 mr-2" />;
      case 'Leadership':
        return <Trophy className="h-4 w-4 mr-2" />;
      default:
        return <Target className="h-4 w-4 mr-2" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">My Goals</CardTitle>
            <Dialog open={isAddingGoal} onOpenChange={setIsAddingGoal}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Goal
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Goal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Goal Title</Label>
                    <Input 
                      id="title" 
                      value={newGoal.title} 
                      onChange={handleInputChange} 
                      placeholder="Enter your goal"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      value={newGoal.description} 
                      onChange={handleInputChange} 
                      placeholder="Provide details about your goal"
                      className="h-24"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={newGoal.category} onValueChange={handleCategoryChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Technical">Technical</SelectItem>
                          <SelectItem value="Learning">Learning</SelectItem>
                          <SelectItem value="Leadership">Leadership</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Input 
                        id="dueDate" 
                        type="date" 
                        value={newGoal.dueDate} 
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsAddingGoal(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="bg-purple-600 hover:bg-purple-700"
                      onClick={handleAddGoal}
                    >
                      Add Goal
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {goals.map((goal) => (
              <Card key={goal.id} className="border border-gray-100 overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{goal.title}</h3>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <div className="flex items-center mr-4">
                          {getCategoryIcon(goal.category)}
                          {goal.category}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Due: {new Date(goal.dueDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleEditGoal(goal)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <p className="text-sm mb-4">{goal.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span className={getStatusColor(goal.status)}>
                        {goal.status === 'not-started' ? 'Not Started' : 
                         goal.status === 'in-progress' ? 'In Progress' : 
                         'Completed'}
                      </span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                    
                    <div className="flex justify-between pt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleUpdateProgress(goal.id, Math.max(0, goal.progress - 10))}
                        disabled={goal.progress === 0}
                      >
                        -10%
                      </Button>
                      <span className="text-sm font-medium">{goal.progress}%</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleUpdateProgress(goal.id, Math.min(100, goal.progress + 10))}
                        disabled={goal.progress === 100}
                      >
                        +10%
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Edit Goal Dialog */}
      <Dialog open={!!editingGoal} onOpenChange={(open) => {
        if (!open) setEditingGoal(null);
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Goal</DialogTitle>
          </DialogHeader>
          {editingGoal && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Goal Title</Label>
                <Input 
                  id="edit-title" 
                  value={editingGoal.title} 
                  onChange={handleEditInputChange} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea 
                  id="edit-description" 
                  value={editingGoal.description} 
                  onChange={handleEditInputChange} 
                  className="h-24"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Select value={editingGoal.category} onValueChange={handleEditCategoryChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Technical">Technical</SelectItem>
                      <SelectItem value="Learning">Learning</SelectItem>
                      <SelectItem value="Leadership">Leadership</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-dueDate">Due Date</Label>
                  <Input 
                    id="edit-dueDate" 
                    type="date" 
                    value={editingGoal.dueDate} 
                    onChange={handleEditInputChange}
                  />
                </div>
              </div>
              
              <div className="space-y-2 pt-2">
                <Label htmlFor="edit-progress">Progress ({editingGoal.progress}%)</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Progress value={editingGoal.progress} className="h-2 col-span-2" />
                  <Input 
                    id="edit-progress" 
                    type="range" 
                    min="0" 
                    max="100" 
                    step="5" 
                    value={editingGoal.progress} 
                    onChange={(e) => {
                      const newProgress = parseInt(e.target.value);
                      setEditingGoal(prev => {
                        if (!prev) return null;
                        const status = 
                          newProgress === 100 ? 'completed' as const : 
                          newProgress === 0 ? 'not-started' as const : 
                          'in-progress' as const;
                        
                        return {
                          ...prev,
                          progress: newProgress,
                          status
                        };
                      });
                    }}
                    className="col-span-2"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setEditingGoal(null)}
                  className="flex items-center"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button 
                  className="bg-purple-600 hover:bg-purple-700 flex items-center"
                  onClick={handleUpdateGoal}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GoalsTab;
