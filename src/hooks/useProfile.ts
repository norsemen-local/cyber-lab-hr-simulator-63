
import { useState, useEffect } from 'react';

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
  }[];
}

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProfile({
        id: "1234",
        firstName: "Alex",
        lastName: "Johnson",
        email: "alex.johnson@techprosolutions.com",
        phone: "555-123-4567", // Ensure phone is always a string
        position: "Senior Developer",
        department: "Engineering",
        joinDate: "2020-03-15",
        manager: "Sarah Williams",
        profileImage: "https://randomuser.me/api/portraits/men/32.jpg",
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
          { id: 1, name: "Employment Contract", date: "2020-03-15", type: "Legal" },
          { id: 2, name: "Performance Review 2021", date: "2021-12-10", type: "Review" },
          { id: 3, name: "Training Certificate", date: "2022-05-20", type: "Certificate" },
          { id: 4, name: "Benefits Documentation", date: "2023-01-05", type: "HR" },
          { id: 5, name: "Project Proposal", date: "2023-06-18", type: "Work" }
        ]
      });
      setLoading(false);
    }, 1000);
  }, []);

  const updateProfile = (updatedProfile: Partial<UserProfile>) => {
    setProfile(prev => prev ? { ...prev, ...updatedProfile } : null);
    // In a real app, this would call an API to update the profile
    console.log("Profile updated:", updatedProfile);
    return true;
  };

  return { profile, loading, updateProfile };
};
