
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import DashboardWithSidebar from "../components/dashboard/DashboardWithSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Mail, Phone, MapPin, Building, Calendar, FileText, Shield, Plus, Trash2 } from "lucide-react";
import { dbService, setupUserProfile } from "../services/databaseService";
import { useToast } from "@/components/ui/use-toast";

const Profile = () => {
  const { tab } = useParams<{ tab: string }>();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("personal");
  
  const [userProfile, setUserProfile] = useState({
    id: "",
    name: "",
    email: "",
    position: "",
    department: "",
    phone: "",
    address: "",
    hireDate: "",
    manager: "",
    bio: "",
    socialSecurity: "",
    bankAccount: "",
  });

  const [careerHistory, setCareerHistory] = useState<Array<{
    id: number;
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }>>([]);

  const [documents, setDocuments] = useState<Array<{
    id: number;
    name: string;
    date: string;
    type: string;
  }>>([]);

  // Form states for new items
  const [newExperience, setNewExperience] = useState({
    company: "",
    position: "",
    startDate: "",
    endDate: "",
    description: ""
  });

  const [isAddingExperience, setIsAddingExperience] = useState(false);

  // Load profile data
  useEffect(() => {
    setupUserProfile();
    
    // Get the first profile (in a real app, this would use the authenticated user ID)
    const profiles = dbService.getAll('profiles');
    if (profiles.length > 0) {
      const profile = profiles[0];
      setUserProfile({
        id: profile.id,
        name: profile.name || "",
        email: profile.email || "",
        position: profile.position || "",
        department: profile.department || "",
        phone: profile.phone || "",
        address: profile.address || "",
        hireDate: profile.hireDate || "",
        manager: profile.manager || "",
        bio: profile.bio || "",
        socialSecurity: profile.socialSecurity || "",
        bankAccount: profile.bankAccount || "",
      });
      
      setCareerHistory(profile.careerHistory || []);
      setDocuments(profile.documents || []);
    }
  }, []);

  // Set the active tab based on the URL param
  useEffect(() => {
    if (tab) {
      setActiveTab(tab);
    }
  }, [tab]);

  // Handle field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setUserProfile((prev) => ({
      ...prev,
      [id]: value
    }));
  };

  // Handle save changes
  const handleSaveChanges = () => {
    if (!userProfile.id) return;
    
    dbService.update('profiles', userProfile.id, {
      ...userProfile,
      careerHistory,
      documents
    });
    
    toast({
      title: "Changes saved",
      description: "Your profile has been updated successfully."
    });
  };

  // Handle new experience form changes
  const handleNewExperienceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewExperience((prev) => ({
      ...prev,
      [id.replace('new-', '')]: value
    }));
  };

  // Add new experience
  const handleAddExperience = () => {
    const newEntry = {
      ...newExperience,
      id: Date.now()
    };
    
    setCareerHistory((prev) => [...prev, newEntry]);
    setIsAddingExperience(false);
    setNewExperience({
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      description: ""
    });
    
    // Save to database
    if (userProfile.id) {
      dbService.update('profiles', userProfile.id, {
        careerHistory: [...careerHistory, newEntry]
      });
      
      toast({
        title: "Experience added",
        description: "Your career history has been updated."
      });
    }
  };

  // Delete experience
  const handleDeleteExperience = (id: number) => {
    const updatedHistory = careerHistory.filter(job => job.id !== id);
    setCareerHistory(updatedHistory);
    
    // Save to database
    if (userProfile.id) {
      dbService.update('profiles', userProfile.id, {
        careerHistory: updatedHistory
      });
      
      toast({
        title: "Experience removed",
        description: "The entry has been deleted from your career history."
      });
    }
  };

  return (
    <DashboardWithSidebar>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">My Profile</h1>
        <p className="text-gray-600">Manage your personal and career information</p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4">
          <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>{userProfile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold">{userProfile.name}</h2>
                <p className="text-sm text-gray-500 mb-2">{userProfile.position}</p>
                <p className="text-xs text-gray-500">{userProfile.department}</p>
                
                <div className="w-full mt-6 space-y-2">
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{userProfile.email}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{userProfile.phone}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{userProfile.address}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Building className="h-4 w-4 mr-2 text-gray-500" />
                    <span>Reports to: {userProfile.manager}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    <span>Hired: {userProfile.hireDate}</span>
                  </div>
                </div>
                
                <Button 
                  className="mt-6 w-full bg-purple-600 hover:bg-purple-700"
                  onClick={() => setActiveTab("personal")}
                >
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all mt-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Sensitive Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="socialSecurity">Social Security Number</Label>
                  <Input 
                    id="socialSecurity" 
                    value={userProfile.socialSecurity} 
                    onChange={handleChange}
                    className="bg-gray-50" 
                  />
                </div>
                <div>
                  <Label htmlFor="bankAccount">Bank Account</Label>
                  <Input 
                    id="bankAccount" 
                    value={userProfile.bankAccount} 
                    onChange={handleChange}
                    className="bg-gray-50" 
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2"
                  onClick={handleSaveChanges}
                >
                  Save Sensitive Info
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="col-span-12 lg:col-span-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full border-b rounded-none bg-transparent mb-6">
              <TabsTrigger value="personal" className="rounded-none">Personal Info</TabsTrigger>
              <TabsTrigger value="career" className="rounded-none">Career History</TabsTrigger>
              <TabsTrigger value="documents" className="rounded-none">Documents</TabsTrigger>
            </TabsList>
            
            <TabsContent value="personal">
              <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Personal Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" value={userProfile.name} onChange={handleChange} />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" value={userProfile.email} onChange={handleChange} />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" value={userProfile.phone} onChange={handleChange} />
                    </div>
                    <div>
                      <Label htmlFor="position">Position</Label>
                      <Input id="position" value={userProfile.position} onChange={handleChange} />
                    </div>
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Input id="department" value={userProfile.department} onChange={handleChange} />
                    </div>
                    <div>
                      <Label htmlFor="manager">Manager</Label>
                      <Input id="manager" value={userProfile.manager} onChange={handleChange} />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" value={userProfile.address} onChange={handleChange} />
                  </div>
                  
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea id="bio" value={userProfile.bio} onChange={handleChange} className="h-32" />
                  </div>
                  
                  <div className="mt-6 flex justify-end space-x-2">
                    <Button variant="outline">Cancel</Button>
                    <Button 
                      className="bg-purple-600 hover:bg-purple-700"
                      onClick={handleSaveChanges}
                    >
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="career">
              <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Career History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {careerHistory.map((job) => (
                      <div key={job.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                        <div className="flex justify-between">
                          <h3 className="font-semibold text-lg">{job.position}</h3>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-red-500"
                            onClick={() => handleDeleteExperience(job.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <Building className="h-4 w-4 mr-1" />
                          <span>{job.company}</span>
                          <span className="mx-2">•</span>
                          <span>{job.startDate} - {job.endDate}</span>
                        </div>
                        <p className="text-sm">{job.description}</p>
                      </div>
                    ))}

                    {isAddingExperience && (
                      <div className="border-t border-gray-100 pt-6">
                        <h3 className="font-semibold text-lg mb-4">Add New Experience</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <Label htmlFor="new-position">Position</Label>
                            <Input 
                              id="new-position" 
                              value={newExperience.position} 
                              onChange={handleNewExperienceChange} 
                            />
                          </div>
                          <div>
                            <Label htmlFor="new-company">Company</Label>
                            <Input 
                              id="new-company" 
                              value={newExperience.company} 
                              onChange={handleNewExperienceChange} 
                            />
                          </div>
                          <div>
                            <Label htmlFor="new-startDate">Start Date</Label>
                            <Input 
                              id="new-startDate" 
                              value={newExperience.startDate} 
                              onChange={handleNewExperienceChange} 
                              placeholder="e.g., January 2020"
                            />
                          </div>
                          <div>
                            <Label htmlFor="new-endDate">End Date</Label>
                            <Input 
                              id="new-endDate" 
                              value={newExperience.endDate} 
                              onChange={handleNewExperienceChange} 
                              placeholder="e.g., Present"
                            />
                          </div>
                        </div>
                        <div className="mb-4">
                          <Label htmlFor="new-description">Description</Label>
                          <Textarea 
                            id="new-description" 
                            value={newExperience.description} 
                            onChange={handleNewExperienceChange} 
                            className="h-24" 
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            onClick={() => setIsAddingExperience(false)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            className="bg-purple-600 hover:bg-purple-700"
                            onClick={handleAddExperience}
                          >
                            Save Experience
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {!isAddingExperience && (
                    <div className="mt-6">
                      <Button 
                        className="bg-purple-600 hover:bg-purple-700"
                        onClick={() => setIsAddingExperience(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Experience
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="documents">
              <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">My Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                        <FileText className="h-5 w-5 text-purple-600 mr-3" />
                        <div className="flex-1">
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-xs text-gray-500">Added: {doc.date}</p>
                        </div>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 flex justify-between">
                    <Button variant="outline">
                      <Shield className="h-4 w-4 mr-2" />
                      Privacy Settings
                    </Button>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <FileText className="h-4 w-4 mr-2" />
                      Upload Document
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardWithSidebar>
  );
};

export default Profile;
