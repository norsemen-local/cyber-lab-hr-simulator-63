
import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  joinDate: string;
  manager: string;
  profileImage: string;
  bio: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  skills: string[];
  education: {
    institution: string;
    degree: string;
    fieldOfStudy: string;
    graduationYear: string;
  }[];
  certifications: {
    name: string;
    issuingOrganization: string;
    issueDate: string;
    expirationDate: string;
  }[];
  documents: {
    id: number;
    name: string;
    date: string;
    type: string;
    content?: string;
  }[];
  careerHistory: {
    id: number;
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
}

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProfile({
        id: "1234",
        firstName: "Alex",
        lastName: "Johnson",
        email: "alex.johnson@techprosolutions.com",
        phone: "555-123-4567",
        position: "Senior Developer",
        department: "Engineering",
        joinDate: "2020-03-15",
        manager: "Sarah Williams",
        profileImage: "https://randomuser.me/api/portraits/men/32.jpg",
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
        certifications: [
          {
            name: "AWS Certified Developer",
            issuingOrganization: "Amazon Web Services",
            issueDate: "2021-05-10",
            expirationDate: "2024-05-10"
          },
          {
            name: "Google Cloud Professional",
            issuingOrganization: "Google",
            issueDate: "2022-01-15",
            expirationDate: "2025-01-15"
          }
        ],
        documents: [
          { id: 1, name: "Employment Contract", date: "2020-03-15", type: "Legal", content: "This employment contract is made between TechPro Solutions and Alex Johnson..." },
          { id: 2, name: "Performance Review 2021", date: "2021-12-10", type: "Review", content: "Annual performance review for Alex Johnson. Overall rating: Exceeds Expectations..." },
          { id: 3, name: "Training Certificate", date: "2022-05-20", type: "Certificate", content: "This certifies that Alex Johnson has successfully completed the Advanced React Training..." },
          { id: 4, name: "Benefits Documentation", date: "2023-01-05", type: "HR", content: "Summary of benefits for employees of TechPro Solutions..." },
          { id: 5, name: "Project Proposal", date: "2023-06-18", type: "Work", content: "Proposal for new customer-facing application improvements..." }
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
      setLoading(false);
    }, 1000);
  }, []);

  const updateProfile = (updatedProfile: Partial<UserProfile>) => {
    setProfile(prev => prev ? { ...prev, ...updatedProfile } : null);
    // In a real app, this would call an API to update the profile
    toast({
      title: "Profile Updated",
      description: "Your changes have been saved successfully",
    });
    return true;
  };

  const updateCareerHistory = (careerHistory: UserProfile['careerHistory']) => {
    setProfile(prev => prev ? { ...prev, careerHistory } : null);
    toast({
      title: "Career History Updated",
      description: "Your career information has been updated",
    });
    return true;
  };

  const addDocument = (document: Omit<UserProfile['documents'][0], 'id'>) => {
    setProfile(prev => {
      if (!prev) return null;
      const newId = prev.documents.length > 0 
        ? Math.max(...prev.documents.map(d => d.id)) + 1 
        : 1;
      return {
        ...prev,
        documents: [...prev.documents, { ...document, id: newId }]
      };
    });
    toast({
      title: "Document Added",
      description: `${document.name} has been uploaded successfully`,
    });
    return true;
  };

  const getDocument = (id: number) => {
    return profile?.documents.find(doc => doc.id === id);
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
