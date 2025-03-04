
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Pencil, Code, Bookmark, Book, CheckCircle2, BookOpen, Award } from "lucide-react";

interface Skill {
  id: number;
  name: string;
  category: string;
  level: number;
  isEndorsed: boolean;
  inProgress: boolean;
  certifications: string[];
}

const skillCategories = [
  { value: "technical", label: "Technical" },
  { value: "soft", label: "Soft Skills" },
  { value: "industry", label: "Industry Knowledge" },
  { value: "tools", label: "Tools & Software" },
  { value: "languages", label: "Languages" },
];

const SkillsTab = () => {
  const [skills, setSkills] = useState<Skill[]>([
    { 
      id: 1, 
      name: "React", 
      category: "technical", 
      level: 85, 
      isEndorsed: true,
      inProgress: false,
      certifications: ["Advanced React Certification"]
    },
    { 
      id: 2, 
      name: "TypeScript", 
      category: "technical", 
      level: 75, 
      isEndorsed: true,
      inProgress: false,
      certifications: []
    },
    { 
      id: 3, 
      name: "Node.js", 
      category: "technical", 
      level: 70, 
      isEndorsed: false,
      inProgress: false,
      certifications: []
    },
    { 
      id: 4, 
      name: "Team Leadership", 
      category: "soft", 
      level: 65, 
      isEndorsed: true,
      inProgress: true,
      certifications: ["Leadership Foundations"]
    },
    { 
      id: 5, 
      name: "AWS", 
      category: "tools", 
      level: 60, 
      isEndorsed: false,
      inProgress: true,
      certifications: []
    },
    { 
      id: 6, 
      name: "UX Design", 
      category: "industry", 
      level: 50, 
      isEndorsed: false,
      inProgress: true,
      certifications: []
    },
  ]);

  const [newSkill, setNewSkill] = useState<Omit<Skill, 'id' | 'isEndorsed' | 'inProgress' | 'certifications'>>({
    name: "",
    category: "technical",
    level: 50
  });

  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [availableCourses, setAvailableCourses] = useState([
    { id: 1, title: "Advanced TypeScript", description: "Master advanced TypeScript concepts", duration: "4 weeks", skillCategory: "technical" },
    { id: 2, title: "AWS Certification Prep", description: "Prepare for AWS certifications", duration: "6 weeks", skillCategory: "tools" },
    { id: 3, title: "Effective Leadership", description: "Develop leadership skills for tech teams", duration: "3 weeks", skillCategory: "soft" },
    { id: 4, title: "UX Research Fundamentals", description: "Learn the basics of UX research", duration: "2 weeks", skillCategory: "industry" },
    { id: 5, title: "GraphQL Masterclass", description: "Building efficient APIs with GraphQL", duration: "4 weeks", skillCategory: "technical" },
  ]);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    
    if (id === "level") {
      setNewSkill(prev => ({
        ...prev,
        [id]: parseInt(value, 10)
      }));
    } else {
      setNewSkill(prev => ({
        ...prev,
        [id]: value
      }));
    }
  };

  const handleCategoryChange = (value: string) => {
    setNewSkill(prev => ({
      ...prev,
      category: value
    }));
  };

  const handleAddSkill = () => {
    if (!newSkill.name) {
      toast({
        title: "Missing Information",
        description: "Please provide a skill name",
        variant: "destructive"
      });
      return;
    }

    const newId = skills.length > 0 ? Math.max(...skills.map(skill => skill.id)) + 1 : 1;
    const updatedSkills = [...skills, {
      id: newId,
      ...newSkill,
      isEndorsed: false,
      inProgress: false,
      certifications: []
    }];
    
    setSkills(updatedSkills);
    setNewSkill({
      name: "",
      category: "technical",
      level: 50
    });
    setIsAddingSkill(false);
    
    toast({
      title: "Skill Added",
      description: "New skill has been added successfully"
    });
  };

  const handleUpdateSkill = (id: number, updates: Partial<Skill>) => {
    setSkills(prev => 
      prev.map(skill => 
        skill.id === id ? { ...skill, ...updates } : skill
      )
    );
    
    if (updates.level) {
      toast({
        title: "Skill Updated",
        description: `Skill level updated to ${updates.level}%`
      });
    }
    
    if (updates.inProgress !== undefined) {
      toast({
        title: updates.inProgress ? "Training Started" : "Training Completed",
        description: updates.inProgress 
          ? "You've started training for this skill" 
          : "You've marked training as completed for this skill"
      });
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical':
        return <Code className="h-4 w-4" />;
      case 'soft':
        return <Bookmark className="h-4 w-4" />;
      case 'industry':
        return <Book className="h-4 w-4" />;
      case 'tools':
        return <Pencil className="h-4 w-4" />;
      case 'languages':
        return <BookOpen className="h-4 w-4" />;
      default:
        return <Code className="h-4 w-4" />;
    }
  };

  const getCategoryLabel = (categoryValue: string) => {
    const category = skillCategories.find(c => c.value === categoryValue);
    return category ? category.label : categoryValue;
  };

  const getFilteredSkills = () => {
    if (!selectedCategory) return skills;
    return skills.filter(skill => skill.category === selectedCategory);
  };

  const getFilteredCourses = () => {
    if (!selectedCategory) return availableCourses;
    return availableCourses.filter(course => course.skillCategory === selectedCategory);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 space-y-4 md:space-y-0">
        <div className="flex flex-wrap gap-2">
          <Badge 
            variant="outline" 
            className={`cursor-pointer ${!selectedCategory ? 'bg-purple-100 text-purple-800' : 'bg-white'}`}
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Badge>
          {skillCategories.map((category) => (
            <Badge 
              key={category.value}
              variant="outline" 
              className={`cursor-pointer ${selectedCategory === category.value ? 'bg-purple-100 text-purple-800' : 'bg-white'}`}
              onClick={() => setSelectedCategory(category.value)}
            >
              <span className="flex items-center">
                {getCategoryIcon(category.value)}
                <span className="ml-1">{category.label}</span>
              </span>
            </Badge>
          ))}
        </div>
        
        <Dialog open={isAddingSkill} onOpenChange={setIsAddingSkill}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Skill
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Skill</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Skill Name</Label>
                <Input 
                  id="name" 
                  value={newSkill.name} 
                  onChange={handleInputChange} 
                  placeholder="e.g., Python, Project Management"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={newSkill.category} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {skillCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="level">Proficiency Level</Label>
                  <span className="text-sm">{newSkill.level}%</span>
                </div>
                <Input 
                  id="level" 
                  type="range" 
                  min="1" 
                  max="100" 
                  value={newSkill.level} 
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddingSkill(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={handleAddSkill}
                >
                  Add Skill
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">My Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {getFilteredSkills().map((skill) => (
                <div key={skill.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="font-medium mr-2">{skill.name}</span>
                      {skill.isEndorsed && (
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Endorsed
                        </Badge>
                      )}
                      {skill.certifications.length > 0 && (
                        <Badge variant="outline" className="bg-green-100 text-green-800 ml-1">
                          <Award className="h-3 w-3 mr-1" />
                          Certified
                        </Badge>
                      )}
                      {skill.inProgress && (
                        <Badge variant="outline" className="bg-amber-100 text-amber-800 ml-1">
                          In Training
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center">
                      {getCategoryIcon(skill.category)}
                      <span className="ml-1">{getCategoryLabel(skill.category)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => handleUpdateSkill(skill.id, { level: Math.max(0, skill.level - 5) })}
                    >
                      -
                    </Button>
                    <div className="flex-1">
                      <Progress value={skill.level} className="h-2" />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => handleUpdateSkill(skill.id, { level: Math.min(100, skill.level + 5) })}
                    >
                      +
                    </Button>
                    <span className="text-xs font-medium w-8 text-right">{skill.level}%</span>
                  </div>
                  
                  {skill.certifications.length > 0 && (
                    <div className="text-xs text-gray-600">
                      <span className="font-medium">Certifications:</span> {skill.certifications.join(", ")}
                    </div>
                  )}
                  
                  {!skill.inProgress ? (
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => handleUpdateSkill(skill.id, { inProgress: true })}
                      >
                        <BookOpen className="h-3 w-3 mr-1" />
                        Start Training
                      </Button>
                    </div>
                  ) : (
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs text-green-600"
                        onClick={() => handleUpdateSkill(skill.id, { inProgress: false })}
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Complete Training
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Recommended Training</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getFilteredCourses().length > 0 ? (
                getFilteredCourses().map((course) => (
                  <Card key={course.id} className="border border-gray-100">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-base">{course.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                          <div className="flex items-center mt-2 text-xs text-gray-500">
                            <span className="flex items-center">
                              {getCategoryIcon(course.skillCategory)}
                              <span className="ml-1">{getCategoryLabel(course.skillCategory)}</span>
                            </span>
                            <span className="mx-2">•</span>
                            <span>Duration: {course.duration}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Button className="bg-purple-600 hover:bg-purple-700 text-xs h-8">
                          <BookOpen className="h-3 w-3 mr-1" />
                          Enroll
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Book className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                  <p>No courses available for the selected category</p>
                  <Button 
                    variant="link" 
                    className="mt-2 text-purple-600"
                    onClick={() => setSelectedCategory(null)}
                  >
                    View all courses
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SkillsTab;
