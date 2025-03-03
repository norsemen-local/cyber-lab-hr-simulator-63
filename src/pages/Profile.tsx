
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import DashboardWithSidebar from "../components/dashboard/DashboardWithSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProfile } from "../hooks/useProfile";
import ProfileSidebar from "../components/profile/ProfileSidebar";
import SensitiveInfoCard from "../components/profile/SensitiveInfoCard";
import PersonalInfoTab from "../components/profile/PersonalInfoTab";
import CareerHistoryTab from "../components/profile/CareerHistoryTab";
import DocumentsTab from "../components/profile/DocumentsTab";

const Profile = () => {
  const { tab } = useParams<{ tab: string }>();
  const [activeTab, setActiveTab] = useState("personal");
  
  const {
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
  } = useProfile();

  // Set the active tab based on the URL param
  useEffect(() => {
    if (tab) {
      setActiveTab(tab);
    }
  }, [tab]);

  return (
    <DashboardWithSidebar>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">My Profile</h1>
        <p className="text-gray-600">Manage your personal and career information</p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4">
          <ProfileSidebar 
            userProfile={userProfile} 
            setActiveTab={setActiveTab} 
          />
          
          <SensitiveInfoCard 
            userProfile={userProfile} 
            handleChange={handleChange} 
            handleSaveChanges={handleSaveChanges} 
          />
        </div>
        
        <div className="col-span-12 lg:col-span-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full border-b rounded-none bg-transparent mb-6">
              <TabsTrigger value="personal" className="rounded-none">Personal Info</TabsTrigger>
              <TabsTrigger value="career" className="rounded-none">Career History</TabsTrigger>
              <TabsTrigger value="documents" className="rounded-none">Documents</TabsTrigger>
            </TabsList>
            
            <TabsContent value="personal">
              <PersonalInfoTab 
                userProfile={userProfile} 
                handleChange={handleChange} 
                handleSaveChanges={handleSaveChanges} 
              />
            </TabsContent>
            
            <TabsContent value="career">
              <CareerHistoryTab 
                careerHistory={careerHistory}
                handleDeleteExperience={handleDeleteExperience}
                handleAddExperience={handleAddExperience}
                newExperience={newExperience}
                handleNewExperienceChange={handleNewExperienceChange}
                isAddingExperience={isAddingExperience}
                setIsAddingExperience={setIsAddingExperience}
              />
            </TabsContent>
            
            <TabsContent value="documents">
              <DocumentsTab documents={documents} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardWithSidebar>
  );
};

export default Profile;
