
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">HR Portal</h1>
            <p className="text-gray-500">Welcome, {currentUser.name}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
        
        {/* Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <User className="mr-2 h-5 w-5 text-primary" />
                My Profile
              </CardTitle>
              <CardDescription>View and update your profile information</CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <FileText className="mr-2 h-5 w-5 text-primary" />
                Documents
              </CardTitle>
              <CardDescription>Access and manage your documents</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">You have no documents yet.</p>
              <Button className="mt-4 w-full" variant="outline" size="sm">
                Upload Document
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-primary" />
                Leave Requests
              </CardTitle>
              <CardDescription>Manage your time off</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">No pending leave requests.</p>
              <Button className="mt-4 w-full" variant="outline" size="sm">
                Request Leave
              </Button>
            </CardContent>
          </Card>
          
          {currentUser.role === 'hr' && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Settings className="mr-2 h-5 w-5 text-primary" />
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
                  <div className="space-y-4">
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
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Users className="mr-2 h-5 w-5 text-primary" />
                  Team Management
                </CardTitle>
                <CardDescription>View and manage your team</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Manage team members and approve requests.</p>
                <Button className="mt-4 w-full" variant="outline" size="sm">
                  View Team
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
