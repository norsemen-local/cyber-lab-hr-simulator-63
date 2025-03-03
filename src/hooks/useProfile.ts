
import { useState, useEffect } from "react";
import { dbService, setupUserProfile } from "../services/databaseService";
import { useToast } from "@/components/ui/use-toast";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  phone: string;
  address: string;
  hireDate: string;
  manager: string;
  bio: string;
  socialSecurity: string;
  bankAccount: string;
}

interface CareerEntry {
  id: number;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Document {
  id: number;
  name: string;
  date: string;
  type: string;
}

export const useProfile = () => {
  const { toast } = useToast();
  
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: "",
    name: "",
    email: "",
    position: "",
    department: "",
    phone: "",
    address: "",
    hireDate: "",
    manager: "",
    bio: "",
    socialSecurity: "",
    bankAccount: "",
  });

  const [careerHistory, setCareerHistory] = useState<CareerEntry[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isAddingExperience, setIsAddingExperience] = useState(false);
  const [newExperience, setNewExperience] = useState({
    company: "",
    position: "",
    startDate: "",
    endDate: "",
    description: ""
  });

  // Load profile data
  useEffect(() => {
    setupUserProfile();
    
    // Get the first profile (in a real app, this would use the authenticated user ID)
    const profiles = dbService.getAll('profiles');
    if (profiles.length > 0) {
      const profile = profiles[0];
      setUserProfile({
        id: profile.id,
        name: profile.name || "",
        email: profile.email || "",
        position: profile.position || "",
        department: profile.department || "",
        phone: profile.phone || "",
        address: profile.address || "",
        hireDate: profile.hireDate || "",
        manager: profile.manager || "",
        bio: profile.bio || "",
        socialSecurity: profile.socialSecurity || "",
        bankAccount: profile.bankAccount || "",
      });
      
      setCareerHistory(profile.careerHistory || []);
      setDocuments(profile.documents || []);
    }
  }, []);

  // Handle field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setUserProfile((prev) => ({
      ...prev,
      [id]: value
    }));
  };

  // Handle save changes
  const handleSaveChanges = () => {
    if (!userProfile.id) return;
    
    dbService.update('profiles', userProfile.id, {
      ...userProfile,
      careerHistory,
      documents
    });
    
    toast({
      title: "Changes saved",
      description: "Your profile has been updated successfully."
    });
  };

  // Handle new experience form changes
  const handleNewExperienceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewExperience((prev) => ({
      ...prev,
      [id.replace('new-', '')]: value
    }));
  };

  // Add new experience
  const handleAddExperience = () => {
    const newEntry = {
      ...newExperience,
      id: Date.now()
    };
    
    setCareerHistory((prev) => [...prev, newEntry]);
    setIsAddingExperience(false);
    setNewExperience({
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      description: ""
    });
    
    // Save to database
    if (userProfile.id) {
      dbService.update('profiles', userProfile.id, {
        careerHistory: [...careerHistory, newEntry]
      });
      
      toast({
        title: "Experience added",
        description: "Your career history has been updated."
      });
    }
  };

  // Delete experience
  const handleDeleteExperience = (id: number) => {
    const updatedHistory = careerHistory.filter(job => job.id !== id);
    setCareerHistory(updatedHistory);
    
    // Save to database
    if (userProfile.id) {
      dbService.update('profiles', userProfile.id, {
        careerHistory: updatedHistory
      });
      
      toast({
        title: "Experience removed",
        description: "The entry has been deleted from your career history."
      });
    }
  };

  return {
    userProfile,
    careerHistory,
    documents,
    isAddingExperience,
    setIsAddingExperience,
    newExperience,
    handleChange,
    handleSaveChanges,
    handleNewExperienceChange,
    handleAddExperience,
    handleDeleteExperience
  };
};
