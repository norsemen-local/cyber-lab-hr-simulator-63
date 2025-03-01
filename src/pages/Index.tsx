
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Upload, 
  FileText, 
  Users, 
  Calendar, 
  BarChart, 
  User, 
  LogIn,
  Lock,
  CheckCircle
} from "lucide-react";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [userDetails, setUserDetails] = useState({
    fullName: "",
    email: "",
    socialSecurityNumber: "",
    dateOfBirth: "",
    gender: "",
    bankAccount: "",
    salary: "",
    position: "",
    department: "",
    manager: "",
    startDate: "",
  });
  
  // Mock authentication - intentionally vulnerable for security demonstration
  const handleLogin = (e) => {
    e.preventDefault();
    // Insecure direct authentication - vulnerable to SQL injection
    console.log(`Attempting SQL query: SELECT * FROM users WHERE username='${username}' AND password='${password}'`);
    
    // For demo purposes, any login works
    setIsLoggedIn(true);
    setCurrentUser({
      id: 1,
      name: username || "John Doe",
      role: "employee",
      avatar: "/placeholder.svg"
    });
    
    // Check if this is a new user
    if (username === "newuser") {
      setIsNewUser(true);
    }
  };
  
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Insecure file upload - no validation
      console.log(`Uploading file: ${file.name} without any validation`);
      // Vulnerable to SSRF - would directly upload to S3
      console.log(`SSRF vulnerable endpoint: /api/upload?url=s3://employee-bucket/${currentUser?.id}/${file.name}`);
      
      // Mock success response
      alert(`File ${file.name} uploaded successfully!`);
    }
  };
  
  const completeWizard = () => {
    // Generate and "upload" PDF with user details
    console.log("Generating PDF with sensitive information:", userDetails);
    console.log("Uploading to S3 bucket (vulnerable to path traversal)");
    
    setIsNewUser(false);
    setWizardStep(1);
  };
  
  // Render login screen if not logged in
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle className="text-2xl text-center">HR Portal</CardTitle>
            <CardDescription className="text-center">
              Login to access your employee dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Input 
                  id="username" 
                  placeholder="Username" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full">
                <LogIn className="mr-2 h-4 w-4" /> Log In
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-center w-full text-gray-500">
              This application is deliberately vulnerable for security training purposes.
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Render new user wizard
  if (isNewUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-[800px]">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Employee Onboarding</CardTitle>
            <CardDescription className="text-center">
              Step {wizardStep} of 3: {wizardStep === 1 ? "Personal Information" : wizardStep === 2 ? "Employment Details" : "Document Upload"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {wizardStep === 1 && (
              <div className="space-y-4">
                <Input 
                  placeholder="Full Name" 
                  value={userDetails.fullName}
                  onChange={(e) => setUserDetails({...userDetails, fullName: e.target.value})}
                />
                <Input 
                  placeholder="Email" 
                  value={userDetails.email}
                  onChange={(e) => setUserDetails({...userDetails, email: e.target.value})}
                />
                <Input 
                  placeholder="Social Security Number" 
                  value={userDetails.socialSecurityNumber}
                  onChange={(e) => setUserDetails({...userDetails, socialSecurityNumber: e.target.value})}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    type="date" 
                    placeholder="Date of Birth" 
                    value={userDetails.dateOfBirth}
                    onChange={(e) => setUserDetails({...userDetails, dateOfBirth: e.target.value})}
                  />
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                    value={userDetails.gender}
                    onChange={(e) => setUserDetails({...userDetails, gender: e.target.value})}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            )}
            
            {wizardStep === 2 && (
              <div className="space-y-4">
                <Input 
                  placeholder="Bank Account Number" 
                  value={userDetails.bankAccount}
                  onChange={(e) => setUserDetails({...userDetails, bankAccount: e.target.value})}
                />
                <Input 
                  placeholder="Salary" 
                  type="number"
                  value={userDetails.salary}
                  onChange={(e) => setUserDetails({...userDetails, salary: e.target.value})}
                />
                <Input 
                  placeholder="Position" 
                  value={userDetails.position}
                  onChange={(e) => setUserDetails({...userDetails, position: e.target.value})}
                />
                <Input 
                  placeholder="Department" 
                  value={userDetails.department}
                  onChange={(e) => setUserDetails({...userDetails, department: e.target.value})}
                />
                <Input 
                  placeholder="Manager" 
                  value={userDetails.manager}
                  onChange={(e) => setUserDetails({...userDetails, manager: e.target.value})}
                />
                <Input 
                  type="date" 
                  placeholder="Start Date" 
                  value={userDetails.startDate}
                  onChange={(e) => setUserDetails({...userDetails, startDate: e.target.value})}
                />
              </div>
            )}
            
            {wizardStep === 3 && (
              <div className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-4" />
                  <h3 className="mb-1 text-lg font-semibold">Upload Identity Documents</h3>
                  <p className="text-sm text-gray-500 mb-4">Upload your ID, passport or driver's license</p>
                  <input
                    type="file"
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4 file:rounded-md
                      file:border-0 file:text-sm file:font-semibold
                      file:bg-primary file:text-primary-foreground
                      hover:file:bg-primary/90"
                    onChange={handleFileUpload}
                  />
                </div>
                
                <div className="mt-8">
                  <h3 className="font-medium mb-2">Information Review</h3>
                  <table className="w-full text-sm">
                    <tbody>
                      {Object.entries(userDetails).filter(([_, v]) => v).map(([key, value]) => (
                        <tr key={key} className="border-b">
                          <td className="py-2 capitalize">{key.replace(/([A-Z])/g, ' $1')}</td>
                          <td className="py-2 text-right">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => wizardStep > 1 ? setWizardStep(wizardStep - 1) : null}
              disabled={wizardStep === 1}
            >
              Back
            </Button>
            {wizardStep < 3 ? (
              <Button onClick={() => setWizardStep(wizardStep + 1)}>Next</Button>
            ) : (
              <Button onClick={completeWizard}>Complete & Generate PDF</Button>
            )}
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Main dashboard after login
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">HR Portal</h1>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium">{currentUser?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{currentUser?.role}</p>
            </div>
            <Avatar>
              <AvatarImage src={currentUser?.avatar} />
              <AvatarFallback>{currentUser?.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Tabs defaultValue="documents">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="documents">
              <FileText className="h-4 w-4 mr-2" /> Documents
            </TabsTrigger>
            <TabsTrigger value="leave">
              <Calendar className="h-4 w-4 mr-2" /> Leave Requests
            </TabsTrigger>
            <TabsTrigger value="org">
              <Users className="h-4 w-4 mr-2" /> Organization
            </TabsTrigger>
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" /> My Profile
            </TabsTrigger>
            <TabsTrigger value="admin" disabled={currentUser?.role !== "hr"}>
              <Lock className="h-4 w-4 mr-2" /> Admin
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="documents" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>My Documents</CardTitle>
                <CardDescription>View and manage your uploaded documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-4" />
                    <h3 className="mb-1 text-lg font-semibold">Upload Documents</h3>
                    <p className="text-sm text-gray-500 mb-4">Upload any document to your personal folder</p>
                    <input
                      type="file"
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4 file:rounded-md
                        file:border-0 file:text-sm file:font-semibold
                        file:bg-primary file:text-primary-foreground
                        hover:file:bg-primary/90"
                      onChange={handleFileUpload}
                    />
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Document Name</th>
                        <th className="text-left py-3 px-4">Type</th>
                        <th className="text-left py-3 px-4">Upload Date</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 px-4">employee_details.pdf</td>
                        <td className="py-3 px-4">PDF</td>
                        <td className="py-3 px-4">2023-06-15</td>
                        <td className="py-3 px-4">
                          <Button variant="ghost" size="sm">View</Button>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">id_card.jpg</td>
                        <td className="py-3 px-4">Image</td>
                        <td className="py-3 px-4">2023-06-10</td>
                        <td className="py-3 px-4">
                          <Button variant="ghost" size="sm">View</Button>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">contract.docx</td>
                        <td className="py-3 px-4">Document</td>
                        <td className="py-3 px-4">2023-05-22</td>
                        <td className="py-3 px-4">
                          <Button variant="ghost" size="sm">View</Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="leave" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Leave Requests</CardTitle>
                <CardDescription>Request time off, sick days or vacation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">New Request</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Leave Type</label>
                        <select className="w-full p-2 border rounded">
                          <option>Vacation</option>
                          <option>Sick Leave</option>
                          <option>Personal Time Off</option>
                          <option>Work From Home</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Status</label>
                        <div className="py-2">Pending Approval</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Start Date</label>
                        <Input type="date" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">End Date</label>
                        <Input type="date" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Reason</label>
                      <textarea className="w-full p-2 border rounded" rows={3}></textarea>
                    </div>
                    <Button>Submit Request</Button>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Recent Requests</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4">Type</th>
                            <th className="text-left py-3 px-4">From</th>
                            <th className="text-left py-3 px-4">To</th>
                            <th className="text-left py-3 px-4">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="py-3 px-4">Vacation</td>
                            <td className="py-3 px-4">2023-07-10</td>
                            <td className="py-3 px-4">2023-07-14</td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Approved
                              </span>
                            </td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-3 px-4">Sick Leave</td>
                            <td className="py-3 px-4">2023-05-03</td>
                            <td className="py-3 px-4">2023-05-04</td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Approved
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="org" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Organization Chart</CardTitle>
                <CardDescription>View company structure and hierarchy</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <div className="w-full max-w-3xl">
                    {/* Simple org chart */}
                    <div className="flex flex-col items-center">
                      <div className="border rounded-lg p-4 bg-primary/10 w-64 text-center">
                        <h3 className="font-medium">CEO</h3>
                        <p className="text-sm">John Executive</p>
                      </div>
                      <div className="h-8 w-px bg-gray-300"></div>
                      <div className="flex space-x-8">
                        <div className="flex flex-col items-center">
                          <div className="border rounded-lg p-4 bg-primary/10 w-48 text-center">
                            <h3 className="font-medium">CTO</h3>
                            <p className="text-sm">Jane Technology</p>
                          </div>
                          <div className="h-8 w-px bg-gray-300"></div>
                          <div className="flex space-x-4">
                            <div className="border rounded-lg p-4 bg-primary/10 w-32 text-center">
                              <h3 className="font-medium">Lead Dev</h3>
                              <p className="text-sm">Tom Code</p>
                            </div>
                            <div className="border rounded-lg p-4 bg-primary/10 w-32 text-center">
                              <h3 className="font-medium">QA Lead</h3>
                              <p className="text-sm">Alice Test</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="border rounded-lg p-4 bg-primary/10 w-48 text-center">
                            <h3 className="font-medium">HR Director</h3>
                            <p className="text-sm">Bob People</p>
                          </div>
                          <div className="h-8 w-px bg-gray-300"></div>
                          <div className="border rounded-lg p-4 bg-primary/10 w-32 text-center">
                            <h3 className="font-medium">HR Manager</h3>
                            <p className="text-sm">Carol Hire</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>My Profile</CardTitle>
                <CardDescription>View and update your personal information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">Personal Information</h3>
                      <div className="grid gap-2 mt-2">
                        <div>
                          <label className="text-sm font-medium">Full Name</label>
                          <Input defaultValue={currentUser?.name} />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Email</label>
                          <Input defaultValue="employee@example.com" />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Phone</label>
                          <Input defaultValue="+1 (555) 123-4567" />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Social Security Number</label>
                          <Input defaultValue="123-45-6789" />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Date of Birth</label>
                          <Input defaultValue="1980-05-15" type="date" />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium">Bank Information</h3>
                      <div className="grid gap-2 mt-2">
                        <div>
                          <label className="text-sm font-medium">Bank Name</label>
                          <Input defaultValue="First National Bank" />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Account Number</label>
                          <Input defaultValue="9876543210" />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Routing Number</label>
                          <Input defaultValue="078912345" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">Employment Information</h3>
                      <div className="grid gap-2 mt-2">
                        <div>
                          <label className="text-sm font-medium">Position</label>
                          <Input defaultValue="Software Developer" readOnly />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Department</label>
                          <Input defaultValue="Engineering" readOnly />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Manager</label>
                          <Input defaultValue="Tom Code" readOnly />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Start Date</label>
                          <Input defaultValue="2022-03-01" type="date" readOnly />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Salary</label>
                          <Input defaultValue="$85,000" readOnly />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium">Emergency Contact</h3>
                      <div className="grid gap-2 mt-2">
                        <div>
                          <label className="text-sm font-medium">Contact Name</label>
                          <Input defaultValue="Jane Doe" />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Relationship</label>
                          <Input defaultValue="Spouse" />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Phone</label>
                          <Input defaultValue="+1 (555) 987-6543" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="admin" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Admin Panel</CardTitle>
                <CardDescription>Manage employees and company data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Lock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium">Admin Access Restricted</h3>
                  <p className="text-gray-500">Only HR personnel can access this section</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="bg-white border-t mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center">
            <p className="text-sm text-gray-500">
              HR Portal | Security Training Application | v1.0.0
            </p>
            <p className="text-xs text-gray-400 mt-1">
              This application contains deliberate security vulnerabilities for training purposes
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
