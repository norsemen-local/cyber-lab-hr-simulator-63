
import { useState } from "react";
import DashboardWithSidebar from "../components/dashboard/DashboardWithSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock, AlertTriangle, CheckCircle, Calendar, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/DatePickerWithRange";

const TimeManagement = () => {
  const [leaveRequests, setLeaveRequests] = useState([
    {
      id: 1,
      type: "Vacation",
      startDate: "2023-11-15",
      endDate: "2023-11-20",
      status: "approved",
      requestedOn: "2023-10-28"
    },
    {
      id: 2,
      type: "Sick Leave",
      startDate: "2023-10-10",
      endDate: "2023-10-12",
      status: "approved",
      requestedOn: "2023-10-09"
    },
    {
      id: 3,
      type: "Personal Leave",
      startDate: "2023-12-20",
      endDate: "2023-12-23",
      status: "pending",
      requestedOn: "2023-10-30"
    }
  ]);

  const attendanceData = [
    { date: "2023-11-01", checkIn: "08:55 AM", checkOut: "05:10 PM", status: "on-time" },
    { date: "2023-11-02", checkIn: "09:10 AM", checkOut: "05:30 PM", status: "late" },
    { date: "2023-11-03", checkIn: "08:50 AM", checkOut: "05:05 PM", status: "on-time" },
    { date: "2023-11-06", checkIn: "08:45 AM", checkOut: "05:15 PM", status: "on-time" },
    { date: "2023-11-07", checkIn: "09:25 AM", checkOut: "05:30 PM", status: "late" },
    { date: "2023-11-08", checkIn: "08:50 AM", checkOut: "05:05 PM", status: "on-time" }
  ];

  const timesheetData = [
    { date: "2023-11-01", project: "Web App Redesign", hours: 6, description: "Frontend development" },
    { date: "2023-11-01", project: "API Integration", hours: 2, description: "API testing" },
    { date: "2023-11-02", project: "Web App Redesign", hours: 4, description: "UI component creation" },
    { date: "2023-11-02", project: "Team Meeting", hours: 2, description: "Sprint planning" },
    { date: "2023-11-02", project: "API Integration", hours: 2, description: "Debugging" },
    { date: "2023-11-03", project: "Web App Redesign", hours: 5, description: "Responsive design implementation" },
    { date: "2023-11-03", project: "Training", hours: 3, description: "React advanced patterns" }
  ];

  const leaveTypes = [
    "Vacation",
    "Sick Leave",
    "Personal Leave",
    "Bereavement",
    "Jury Duty",
    "Maternity/Paternity"
  ];

  const projects = [
    "Web App Redesign",
    "API Integration",
    "Database Migration",
    "Team Meeting",
    "Training",
    "Administrative"
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "rejected":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getAttendanceStatusColor = (status: string) => {
    switch (status) {
      case "on-time":
        return "bg-green-100 text-green-800 border-green-200";
      case "late":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "absent":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <DashboardWithSidebar>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Time Management</h1>
        <p className="text-gray-600">Manage your leave requests, attendance, and timesheets</p>
      </div>

      <Tabs defaultValue="leave">
        <TabsList className="w-full bg-transparent border-b rounded-none mb-6">
          <TabsTrigger value="leave" className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent">
            Leave Requests
          </TabsTrigger>
          <TabsTrigger value="attendance" className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent">
            Attendance
          </TabsTrigger>
          <TabsTrigger value="timesheet" className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent">
            Timesheet
          </TabsTrigger>
        </TabsList>

        {/* Leave Requests Tab */}
        <TabsContent value="leave">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">My Leave Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {leaveRequests.map((request) => (
                      <div key={request.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="mb-2 md:mb-0">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                            <span className="font-medium">{request.type}</span>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            Requested on {new Date(request.requestedOn).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Badge variant="outline" className={`flex items-center gap-1 ${getStatusColor(request.status)}`}>
                            {getStatusIcon(request.status)}
                            {request.status}
                          </Badge>
                          <Button variant="ghost" size="sm" className="ml-2">
                            Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Request Leave</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div>
                      <Label htmlFor="leaveType">Leave Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select leave type" />
                        </SelectTrigger>
                        <SelectContent>
                          {leaveTypes.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Date Range</Label>
                      <DatePickerWithRange />
                    </div>
                    
                    <div>
                      <Label htmlFor="reason">Reason</Label>
                      <Textarea id="reason" placeholder="Provide details for your leave request" />
                    </div>
                    
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      Submit Request
                    </Button>
                  </form>
                </CardContent>
              </Card>
              
              <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all mt-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Leave Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Vacation</span>
                        <span className="text-sm">15 days</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: "75%" }} />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Sick Leave</span>
                        <span className="text-sm">8 days</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: "80%" }} />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Personal Leave</span>
                        <span className="text-sm">3 days</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: "60%" }} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Recent Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-xs text-gray-500 border-b">
                          <th className="text-left font-medium p-3">DATE</th>
                          <th className="text-left font-medium p-3">CHECK IN</th>
                          <th className="text-left font-medium p-3">CHECK OUT</th>
                          <th className="text-left font-medium p-3">WORK HOURS</th>
                          <th className="text-left font-medium p-3">STATUS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceData.map((day, index) => {
                          // Simple calculation of hours (this is just for demonstration)
                          const checkInTime = new Date(`2023-01-01 ${day.checkIn}`);
                          const checkOutTime = new Date(`2023-01-01 ${day.checkOut}`);
                          const hoursWorked = ((checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60)).toFixed(2);
                          
                          return (
                            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="p-3">{new Date(day.date).toLocaleDateString()}</td>
                              <td className="p-3">{day.checkIn}</td>
                              <td className="p-3">{day.checkOut}</td>
                              <td className="p-3">{hoursWorked} hrs</td>
                              <td className="p-3">
                                <Badge variant="outline" className={getAttendanceStatusColor(day.status)}>
                                  {day.status}
                                </Badge>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Today's Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6">
                    <Clock className="w-12 h-12 mx-auto text-purple-600 mb-3" />
                    <div className="text-3xl font-bold mb-1">08:55 AM</div>
                    <div className="text-gray-500 mb-4">Today's Check-in</div>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 mb-2">
                      Check Out
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">
                      Working hours: 9:00 AM - 5:00 PM
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all mt-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Monthly Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <CalendarComponent 
                    mode="single"
                    className="rounded-md border"
                  />
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2" />
                      <span className="text-sm">On Time: 15 days</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2" />
                      <span className="text-sm">Late: 3 days</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2" />
                      <span className="text-sm">Absent: 0 days</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
                      <span className="text-sm">Leave: 2 days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Timesheet Tab */}
        <TabsContent value="timesheet">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Current Week Timesheet</CardTitle>
                  <Button variant="outline" size="sm" className="h-8">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Weekly View
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-xs text-gray-500 border-b">
                          <th className="text-left font-medium p-3">DATE</th>
                          <th className="text-left font-medium p-3">PROJECT</th>
                          <th className="text-left font-medium p-3">HOURS</th>
                          <th className="text-left font-medium p-3">DESCRIPTION</th>
                          <th className="text-left font-medium p-3">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {timesheetData.map((entry, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="p-3">{new Date(entry.date).toLocaleDateString()}</td>
                            <td className="p-3">{entry.project}</td>
                            <td className="p-3">{entry.hours}</td>
                            <td className="p-3">{entry.description}</td>
                            <td className="p-3">
                              <div className="flex space-x-1">
                                <Button variant="ghost" size="sm" className="h-8 px-2">
                                  Edit
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50">
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Add Time Entry</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <div className="relative">
                        <Input 
                          id="date" 
                          type="date" 
                          defaultValue={new Date().toISOString().split('T')[0]} 
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="project">Project</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.map((project) => (
                            <SelectItem key={project} value={project}>{project}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="hours">Hours</Label>
                      <Input 
                        id="hours" 
                        type="number" 
                        min="0.5" 
                        max="24" 
                        step="0.5" 
                        placeholder="Hours spent" 
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea 
                        id="description" 
                        placeholder="What did you work on?" 
                      />
                    </div>
                    
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Time Entry
                    </Button>
                  </form>
                </CardContent>
              </Card>
              
              <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all mt-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Week Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Web App Redesign</span>
                        <span className="text-sm">15 hrs</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: "38%" }} />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">API Integration</span>
                        <span className="text-sm">4 hrs</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: "10%" }} />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Team Meetings</span>
                        <span className="text-sm">2 hrs</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "5%" }} />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Training</span>
                        <span className="text-sm">3 hrs</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: "7.5%" }} />
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t">
                      <div className="flex justify-between">
                        <span className="font-medium">Total Hours</span>
                        <span className="font-medium">24 hrs</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardWithSidebar>
  );
};

export default TimeManagement;
