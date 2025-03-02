
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../../services/authService";
import { useToast } from "@/components/ui/use-toast";

const DashboardHeader = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const currentUser = getCurrentUser();
  
  const handleLogout = () => {
    logout();
    navigate("/login");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };
  
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white/70 backdrop-blur-sm p-4 rounded-lg shadow-sm">
      <div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          HR Portal
        </h1>
        <p className="text-gray-600">Welcome, {currentUser?.name}</p>
      </div>
      <Button 
        variant="outline" 
        onClick={handleLogout}
        className="mt-4 md:mt-0 border border-gray-200 hover:bg-gray-100"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </div>
  );
};

export default DashboardHeader;
