
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardWithSidebar from "../components/dashboard/DashboardWithSidebar";
import { Card } from "@/components/ui/card";
import PersonalInfoTab from "../components/profile/PersonalInfoTab";
import CareerHistoryTab from "../components/profile/CareerHistoryTab";
import DocumentsTab from "../components/profile/DocumentsTab";
import ProfileSidebar from "../components/profile/ProfileSidebar";
import { useProfile } from "../hooks/useProfile";

const Profile = () => {
  const { tab } = useParams();
  const navigate = useNavigate();
  const activeTab = tab || "personal";
  const { profile, loading, updateProfile, updateCareerHistory, addDocument, getDocument } = useProfile();
  
  const handleTabChange = (value: string) => {
    navigate(`/profile/${value}`);
  };

  const handleUpdateProfile = (updatedProfile: any) => {
    console.log("Updating profile with:", updatedProfile);
    updateProfile({
      firstName: updatedProfile.firstName,
      lastName: updatedProfile.lastName,
      email: updatedProfile.email,
      phone: updatedProfile.phone,
      position: updatedProfile.position,
      department: updatedProfile.department,
      manager: updatedProfile.manager,
      bio: updatedProfile.bio,
      address: updatedProfile.address
    });
  };

  if (loading) {
    return (
      <DashboardWithSidebar>
        <div className="flex justify-center items-center h-64">
          <p>Loading profile data...</p>
        </div>
      </DashboardWithSidebar>
    );
  }

  return (
    <DashboardWithSidebar>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/4">
          <ProfileSidebar 
            userProfile={{
              name: `${profile?.firstName} ${profile?.lastName}`,
              email: profile?.email || "",
              position: profile?.position || "",
              department: profile?.department || "",
              phone: profile?.phone || "",
              address: `${profile?.address?.city || ""}, ${profile?.address?.state || ""}`,
              hireDate: profile?.joinDate || "",
              manager: profile?.manager || ""
            }}
            setActiveTab={handleTabChange}
          />
        </div>
        <div className="md:w-3/4">
          <Card className="p-6">
            <Tabs value={activeTab} className="w-full" onValueChange={handleTabChange}>
              <TabsList className="mb-6">
                <TabsTrigger value="personal">Personal Info</TabsTrigger>
                <TabsTrigger value="career">Career History</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>
              
              <TabsContent value="personal" className="space-y-4">
                {profile && (
                  <PersonalInfoTab 
                    userProfile={{
                      firstName: profile.firstName || "",
                      lastName: profile.lastName || "",
                      email: profile.email || "",
                      phone: profile.phone || "",
                      position: profile.position || "",
                      department: profile.department || "",
                      manager: profile.manager || "",
                      address: profile.address || {
                        street: "",
                        city: "",
                        state: "",
                        zipCode: "",
                        country: ""
                      },
                      bio: profile.bio || ""
                    }}
                    onSave={handleUpdateProfile}
                  />
                )}
              </TabsContent>
              
              <TabsContent value="career" className="space-y-4">
                <CareerHistoryTab 
                  careerHistory={profile?.careerHistory || []}
                  onSave={updateCareerHistory}
                />
              </TabsContent>
              
              <TabsContent value="documents" className="space-y-4">
                <DocumentsTab 
                  documents={profile?.documents?.map(doc => ({
                    id: doc.id,
                    name: doc.name,
                    date: doc.uploadDate,
                    type: doc.type,
                    content: doc.content
                  })) || []}
                  onUpload={addDocument}
                  onView={getDocument}
                />
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </DashboardWithSidebar>
  );
};

export default Profile;
