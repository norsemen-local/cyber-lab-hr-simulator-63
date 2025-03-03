
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../services/authService";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import ProfileCard from "../components/dashboard/ProfileCard";
import DocumentsCard from "../components/dashboard/DocumentsCard";
import LeaveRequestsCard from "../components/dashboard/LeaveRequestsCard";
import HRSettingsCard from "../components/dashboard/HRSettingsCard";
import TeamManagementCard from "../components/dashboard/TeamManagementCard";
import { useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  
  useEffect(() => {
    console.log("Index page loaded", { currentUser });
    // If user is not logged in, redirect to login
    if (!currentUser) {
      console.log("No user found, redirecting to login");
      navigate("/login");
    }
  }, [currentUser, navigate]);
  
  // Show a loading state if redirecting
  if (!currentUser) {
    return <div className="p-8 text-center">Loading...</div>;
  }
  
  return (
    <DashboardLayout>
      <DashboardHeader />
      
      {/* Dashboard Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ProfileCard user={currentUser} />
        <DocumentsCard />
        <LeaveRequestsCard />
        
        {currentUser.role === 'hr' && (
          <HRSettingsCard currentUser={currentUser} />
        )}
        
        {(currentUser.role === 'hr' || currentUser.role === 'manager') && (
          <TeamManagementCard />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Index;
