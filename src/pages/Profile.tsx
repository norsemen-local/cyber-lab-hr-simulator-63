
import DashboardWithSidebar from "../components/dashboard/DashboardWithSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Mail, Phone, MapPin, Building, Calendar, FileText, Shield } from "lucide-react";

const Profile = () => {
  const userProfile = {
    name: "John Smith",
    email: "john.smith@example.com",
    position: "Senior Software Engineer",
    department: "Engineering",
    phone: "+1 (555) 123-4567",
    address: "123 Tech Lane, San Francisco, CA 94107",
    hireDate: "2019-05-15",
    manager: "Jane Johnson",
    bio: "Experienced software engineer with expertise in frontend development and a passion for creating intuitive user interfaces.",
    socialSecurity: "XXX-XX-1234", // Sensitive information - deliberately exposed
    bankAccount: "XXXX-XXXX-XXXX-5678", // Sensitive information - deliberately exposed
  };

  const careerHistory = [
    {
      id: 1,
      company: "Current Company",
      position: "Senior Software Engineer",
      startDate: "May 2019",
      endDate: "Present",
      description: "Leading frontend development for the company's main product. Implemented new features and improved performance."
    },
    {
      id: 2,
      company: "Previous Tech",
      position: "Software Engineer",
      startDate: "January 2017",
      endDate: "April 2019",
      description: "Worked on multiple web applications using React and Node.js. Collaborated with cross-functional teams."
    },
    {
      id: 3,
      company: "StartUp Inc",
      position: "Junior Developer",
      startDate: "June 2015",
      endDate: "December 2016",
      description: "Started as an intern and grew into a full-time role. Focused on frontend development with JavaScript."
    }
  ];

  const documents = [
    { id: 1, name: "Employment Contract", date: "2019-05-15", type: "PDF" },
    { id: 2, name: "Tax Information Form", date: "2023-01-10", type: "PDF" },
    { id: 3, name: "Performance Review 2022", date: "2022-12-05", type: "DOCX" },
    { id: 4, name: "Benefits Enrollment", date: "2023-01-15", type: "PDF" },
    { id: 5, name: "Training Certificate", date: "2022-08-22", type: "PDF" }
  ];

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
                  <AvatarFallback>JS</AvatarFallback>
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
                
                <Button className="mt-6 w-full bg-purple-600 hover:bg-purple-700">Edit Profile</Button>
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
                  <Label htmlFor="ssn">Social Security Number</Label>
                  <Input id="ssn" value={userProfile.socialSecurity} readOnly className="bg-gray-50" />
                </div>
                <div>
                  <Label htmlFor="bank">Bank Account</Label>
                  <Input id="bank" value={userProfile.bankAccount} readOnly className="bg-gray-50" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="col-span-12 lg:col-span-8">
          <Tabs defaultValue="personal">
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
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input id="fullName" defaultValue={userProfile.name} />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" defaultValue={userProfile.email} />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" defaultValue={userProfile.phone} />
                    </div>
                    <div>
                      <Label htmlFor="position">Position</Label>
                      <Input id="position" defaultValue={userProfile.position} />
                    </div>
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Input id="department" defaultValue={userProfile.department} />
                    </div>
                    <div>
                      <Label htmlFor="manager">Manager</Label>
                      <Input id="manager" defaultValue={userProfile.manager} />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" defaultValue={userProfile.address} />
                  </div>
                  
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea id="bio" defaultValue={userProfile.bio} className="h-32" />
                  </div>
                  
                  <div className="mt-6 flex justify-end space-x-2">
                    <Button variant="outline">Cancel</Button>
                    <Button className="bg-purple-600 hover:bg-purple-700">Save Changes</Button>
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
                        <h3 className="font-semibold text-lg">{job.position}</h3>
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <Building className="h-4 w-4 mr-1" />
                          <span>{job.company}</span>
                          <span className="mx-2">•</span>
                          <span>{job.startDate} - {job.endDate}</span>
                        </div>
                        <p className="text-sm">{job.description}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6">
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <User className="h-4 w-4 mr-2" />
                      Add Experience
                    </Button>
                  </div>
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
