
import { useState, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import { cn } from "@/lib/utils";
import { getCurrentUser } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

interface DashboardWithSidebarProps {
  children: ReactNode;
}

const DashboardWithSidebar = ({ children }: DashboardWithSidebarProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);
  
  // Show a loading state if redirecting
  if (!currentUser) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-[calc(100vh-49px)] bg-gradient-to-br from-blue-50 to-purple-50 relative overflow-hidden">
      {/* Geometric shapes for visual interest */}
      <div className="absolute top-0 left-0 w-64 h-64 rounded-br-full bg-blue-100 opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-tl-full bg-purple-100 opacity-50"></div>
      <div className="absolute top-1/4 right-1/4 w-40 h-40 rounded-full bg-yellow-100 opacity-40"></div>
      
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div 
        className={cn(
          "transition-all duration-300 ease-in-out min-h-[calc(100vh-49px)]",
          sidebarOpen ? "ml-64" : "ml-0"
        )}
      >
        <div className="p-4 md:p-6 relative z-10">
          <div className="flex items-center mb-6">
            {!sidebarOpen && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="mr-4"
              >
                <Menu className="h-4 w-4" />
              </Button>
            )}
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              HR Dashboard
            </h1>
          </div>
          
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardWithSidebar;
