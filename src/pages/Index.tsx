import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout, updateCompanyCode, getCompanyCode } from "../services/authService";
import { LogOut, Settings, FileText, User, Calendar, Users } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const { toast } = useToast();
  const [newCompanyCode, setNewCompanyCode] = useState("");
  const [showCompanyCodeSettings, setShowCompanyCodeSettings] = useState(false);
  
  // If user is not logged in, redirect to login
  if (!currentUser) {
    navigate("/login");
    return null;
  }
  
  const handleLogout = () => {
    logout();
    navigate("/login");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };
  
  const handleUpdateCompanyCode = () => {
    if (newCompanyCode.trim() === "") {
      toast({
        title: "Error",
        description: "Company registration code cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    const success = updateCompanyCode(newCompanyCode, currentUser);
    
    if (success) {
      toast({
        title: "Success",
        description: "Company registration code updated successfully",
      });
      setNewCompanyCode("");
    } else {
      toast({
        title: "Error",
        description: "Only HR personnel can update the company registration code",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="min-h-[calc(100vh-49px)] bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-8 relative overflow-hidden">
      {/* Geometric shapes for visual interest */}
      <div className="absolute top-0 left-0 w-64 h-64 rounded-br-full bg-blue-100 opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-tl-full bg-purple-100 opacity-50"></div>
      <div className="absolute top-1/4 right-1/4 w-40 h-40 rounded-full bg-yellow-100 opacity-40"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white/70 backdrop-blur-sm p-4 rounded-lg shadow-sm">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              HR Portal
            </h1>
            <p className="text-gray-600">Welcome, {currentUser.name}</p>
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
        
        {/* Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <User className="mr-2 h-5 w-5 text-blue-500" />
                My Profile
              </CardTitle>
              <CardDescription>View and update your profile information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm">
                  <span className="font-medium">Name:</span> {currentUser.name}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Username:</span> {currentUser.username}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Role:</span> {currentUser.role}
                </p>
                <Button className="mt-4 w-full" variant="outline" size="sm">
                  View Profile
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <FileText className="mr-2 h-5 w-5 text-green-500" />
                Documents
              </CardTitle>
              <CardDescription>Access and manage your documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-md p-3 mb-4">
                <p className="text-sm text-center">You have no documents yet.</p>
              </div>
              <Button className="w-full" variant="outline" size="sm">
                Upload Document
              </Button>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-orange-500" />
                Leave Requests
              </CardTitle>
              <CardDescription>Manage your time off</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-md p-3 mb-4">
                <p className="text-sm text-center">No pending leave requests.</p>
              </div>
              <Button className="w-full" variant="outline" size="sm">
                Request Leave
              </Button>
            </CardContent>
          </Card>
          
          {currentUser.role === 'hr' && (
            <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Settings className="mr-2 h-5 w-5 text-purple-500" />
                  HR Settings
                </CardTitle>
                <CardDescription>Manage company settings</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="mb-4 w-full" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowCompanyCodeSettings(!showCompanyCodeSettings)}
                >
                  {showCompanyCodeSettings ? "Hide Company Code Settings" : "Manage Company Registration Code"}
                </Button>
                
                {showCompanyCodeSettings && (
                  <div className="space-y-4 bg-white/70 p-3 rounded-md">
                    <div>
                      <p className="text-sm font-medium mb-1">Current Company Registration Code:</p>
                      <p className="text-sm bg-gray-100 p-2 rounded">{getCompanyCode()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Update Company Registration Code:</p>
                      <div className="flex gap-2">
                        <Input
                          value={newCompanyCode}
                          onChange={(e) => setNewCompanyCode(e.target.value)}
                          placeholder="New code"
                          className="bg-white"
                        />
                        <Button onClick={handleUpdateCompanyCode}>Update</Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          {(currentUser.role === 'hr' || currentUser.role === 'manager') && (
            <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all col-span-1 md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Users className="mr-2 h-5 w-5 text-blue-500" />
                  Team Management
                </CardTitle>
                <CardDescription>View and manage your team</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm">Manage team members and approve requests.</p>
                    <Button className="mt-4 w-full" variant="outline" size="sm">
                      View Team
                    </Button>
                  </div>
                  <div className="hidden md:block">
                    <img 
                      src="https://images.unsplash.com/photo-1581092795360-fd1ca04f0952" 
                      alt="Office worker" 
                      className="rounded-md w-full h-40 object-cover"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
