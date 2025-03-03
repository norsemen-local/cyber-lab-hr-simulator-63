
import { useState } from "react";
import { useParams } from "react-router-dom";
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
  const activeTab = tab || "personal";
  const { profile, loading, updateProfile } = useProfile();

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
          <ProfileSidebar profile={profile} />
        </div>
        <div className="md:w-3/4">
          <Card className="p-6">
            <Tabs value={activeTab} className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="personal">Personal Info</TabsTrigger>
                <TabsTrigger value="career">Career History</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>
              
              <TabsContent value="personal" className="space-y-4">
                <PersonalInfoTab profile={profile} updateProfile={updateProfile} />
              </TabsContent>
              
              <TabsContent value="career" className="space-y-4">
                <CareerHistoryTab profile={profile} updateProfile={updateProfile} />
              </TabsContent>
              
              <TabsContent value="documents" className="space-y-4">
                <DocumentsTab profile={profile} />
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </DashboardWithSidebar>
  );
};

export default Profile;
