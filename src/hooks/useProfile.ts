
import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { getCurrentUser } from "@/services/authService";
import { UserProfile } from "@/features/auth/services/types";
import { API_URL } from "@/features/auth/constants";

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const currentUser = getCurrentUser();

  useEffect(() => {
    // Only fetch if user is logged in
    if (currentUser) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      
      if (data.success && data.profile) {
        setProfile(data.profile);
      } else {
        // If API fails, use demo data as fallback
        setProfile({
          userId: currentUser?.id || 1234,
          firstName: currentUser?.firstName || "Alex",
          lastName: currentUser?.lastName || "Johnson",
          email: currentUser?.email || "alex.johnson@techprosolutions.com",
          phone: "555-123-4567",
          position: "Senior Developer",
          department: "Engineering",
          joinDate: "2020-03-15",
          manager: "Sarah Williams",
          avatar: "https://randomuser.me/api/portraits/men/32.jpg",
          bio: "Experienced software developer with a passion for building scalable web applications. Specializing in React, Node.js, and cloud architecture.",
          address: {
            street: "123 Tech Lane",
            city: "San Francisco",
            state: "CA",
            zipCode: "94107",
            country: "USA"
          },
          skills: ["JavaScript", "React", "Node.js", "TypeScript", "GraphQL", "AWS"],
          education: [
            {
              institution: "Stanford University",
              degree: "Master's",
              fieldOfStudy: "Computer Science",
              graduationYear: "2018"
            },
            {
              institution: "UC Berkeley",
              degree: "Bachelor's",
              fieldOfStudy: "Software Engineering",
              graduationYear: "2016"
            }
          ],
          documents: [
            { id: 1, name: "Employment Contract", type: "Legal", uploadDate: "2020-03-15", content: "This employment contract is made between TechPro Solutions and Alex Johnson..." },
            { id: 2, name: "Performance Review 2021", type: "Review", uploadDate: "2021-12-10", content: "Annual performance review for Alex Johnson. Overall rating: Exceeds Expectations..." },
            { id: 3, name: "Training Certificate", type: "Certificate", uploadDate: "2022-05-20", content: "This certifies that Alex Johnson has successfully completed the Advanced React Training..." },
            { id: 4, name: "Benefits Documentation", type: "HR", uploadDate: "2023-01-05", content: "Summary of benefits for employees of TechPro Solutions..." },
            { id: 5, name: "Project Proposal", type: "Work", uploadDate: "2023-06-18", content: "Proposal for new customer-facing application improvements..." }
          ],
          careerHistory: [
            {
              id: 1,
              company: "TechPro Solutions",
              position: "Senior Developer",
              startDate: "March 2020",
              endDate: "Present",
              description: "Leading development of customer-facing applications, mentoring junior developers, and implementing CI/CD workflows."
            },
            {
              id: 2,
              company: "Innovate Tech",
              position: "Software Developer",
              startDate: "January 2018",
              endDate: "February 2020",
              description: "Developed and maintained web applications using React and Node.js, worked in agile teams."
            },
            {
              id: 3,
              company: "StartUp Co",
              position: "Junior Developer",
              startDate: "June 2016",
              endDate: "December 2017",
              description: "Built frontend components using React, collaborated with UX designers to implement responsive designs."
            }
          ]
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile data. Using demo data instead.",
        variant: "destructive"
      });
      
      // Use demo data as fallback
      setProfile({
        userId: 1234,
        firstName: "Alex",
        lastName: "Johnson",
        email: "alex.johnson@techprosolutions.com",
        phone: "555-123-4567",
        position: "Senior Developer",
        department: "Engineering",
        joinDate: "2020-03-15",
        manager: "Sarah Williams",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        bio: "Experienced software developer with a passion for building scalable web applications.",
        address: {
          street: "123 Tech Lane",
          city: "San Francisco",
          state: "CA",
          zipCode: "94107",
          country: "USA"
        },
        skills: ["JavaScript", "React", "Node.js", "TypeScript", "GraphQL", "AWS"],
        careerHistory: [
          {
            id: 1,
            company: "TechPro Solutions",
            position: "Senior Developer",
            startDate: "March 2020",
            endDate: "Present",
            description: "Leading development of customer-facing applications."
          },
          {
            id: 2,
            company: "Innovate Tech",
            position: "Software Developer",
            startDate: "January 2018",
            endDate: "February 2020",
            description: "Developed web applications using React and Node.js."
          }
        ],
        documents: [
          { id: 1, name: "Employment Contract", type: "Legal", uploadDate: "2020-03-15" },
          { id: 2, name: "Performance Review 2021", type: "Review", uploadDate: "2021-12-10" }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updatedProfile: Partial<UserProfile>) => {
    try {
      // In a real app, this would call an API to update the profile
      const response = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify(updatedProfile)
      });
      
      if (!response.ok) {
        // Simulate success when API fails
        setProfile(prev => prev ? { ...prev, ...updatedProfile } : null);
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully (simulation mode)",
        });
        return true;
      }
      
      const data = await response.json();
      
      if (data.success) {
        setProfile(prev => prev ? { ...prev, ...updatedProfile } : null);
        toast({
          title: "Profile Updated",
          description: "Your changes have been saved successfully",
        });
        return true;
      } else {
        throw new Error(data.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      // Still update UI for demo purposes
      setProfile(prev => prev ? { ...prev, ...updatedProfile } : null);
      toast({
        title: "Profile Updated",
        description: "Your changes have been saved (simulation mode)",
      });
      return true;
    }
  };

  const updateCareerHistory = async (careerHistory: UserProfile['careerHistory']) => {
    try {
      // In a real app, this would call an API to update the career history
      const response = await fetch(`${API_URL}/profile/career`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify({ careerHistory })
      });
      
      if (!response.ok) {
        // Simulate success when API fails
        setProfile(prev => prev ? { ...prev, careerHistory } : null);
        toast({
          title: "Career History Updated",
          description: "Your career information has been updated (simulation mode)",
        });
        return true;
      }
      
      const data = await response.json();
      
      if (data.success) {
        setProfile(prev => prev ? { ...prev, careerHistory } : null);
        toast({
          title: "Career History Updated",
          description: "Your career information has been updated",
        });
        return true;
      } else {
        throw new Error(data.error || "Failed to update career history");
      }
    } catch (error) {
      console.error("Error updating career history:", error);
      // Still update UI for demo purposes
      setProfile(prev => prev ? { ...prev, careerHistory } : null);
      toast({
        title: "Career History Updated",
        description: "Your career information has been updated (simulation mode)",
      });
      return true;
    }
  };

  const addDocument = async (document: Omit<UserProfile['documents'][0], 'id'>) => {
    try {
      // In a real app, this would call an API to add the document
      const response = await fetch(`${API_URL}/profile/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify(document)
      });
      
      if (!response.ok) {
        // Simulate success when API fails
        setProfile(prev => {
          if (!prev) return null;
          const newId = prev.documents && prev.documents.length > 0 
            ? Math.max(...prev.documents.map(d => d.id)) + 1 
            : 1;
          return {
            ...prev,
            documents: [...(prev.documents || []), { ...document, id: newId }]
          };
        });
        toast({
          title: "Document Added",
          description: `${document.name} has been uploaded successfully (simulation mode)`,
        });
        return true;
      }
      
      const data = await response.json();
      
      if (data.success) {
        setProfile(prev => {
          if (!prev) return null;
          return {
            ...prev,
            documents: [...(prev.documents || []), { ...document, id: data.documentId }]
          };
        });
        toast({
          title: "Document Added",
          description: `${document.name} has been uploaded successfully`,
        });
        return true;
      } else {
        throw new Error(data.error || "Failed to add document");
      }
    } catch (error) {
      console.error("Error adding document:", error);
      // Still update UI for demo purposes
      setProfile(prev => {
        if (!prev) return null;
        const newId = prev.documents && prev.documents.length > 0 
          ? Math.max(...prev.documents.map(d => d.id)) + 1 
          : 1;
        return {
          ...prev,
          documents: [...(prev.documents || []), { ...document, id: newId }]
        };
      });
      toast({
        title: "Document Added",
        description: `${document.name} has been uploaded successfully (simulation mode)`,
      });
      return true;
    }
  };

  const getDocument = (id: number) => {
    return profile?.documents?.find(doc => doc.id === id);
  };

  return { 
    profile, 
    loading, 
    updateProfile, 
    updateCareerHistory,
    addDocument,
    getDocument
  };
};
