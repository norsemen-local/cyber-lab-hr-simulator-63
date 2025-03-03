
import DashboardWithSidebar from "../components/dashboard/DashboardWithSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const Team = () => {
  const teamMembers = [
    {
      id: 1,
      name: "Jane Johnson",
      role: "Engineering Manager",
      email: "jane.johnson@example.com",
      avatar: "JJ",
      status: "online",
      projects: ["Web App Redesign", "API Integration"]
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Senior Developer",
      email: "michael.chen@example.com",
      avatar: "MC",
      status: "away",
      projects: ["Database Migration", "Web App Redesign"]
    },
    {
      id: 3,
      name: "Sarah Williams",
      role: "UX Designer",
      email: "sarah.williams@example.com",
      avatar: "SW",
      status: "offline",
      projects: ["Mobile App Design", "Web App Redesign"]
    },
    {
      id: 4,
      name: "Robert Kim",
      role: "Backend Developer",
      email: "robert.kim@example.com",
      avatar: "RK",
      status: "online",
      projects: ["API Integration", "Database Migration"]
    },
    {
      id: 5,
      name: "Emily Davis",
      role: "Frontend Developer",
      email: "emily.davis@example.com",
      avatar: "ED",
      status: "online",
      projects: ["Web App Redesign", "Mobile App Development"]
    },
    {
      id: 6,
      name: "David Wilson",
      role: "QA Engineer",
      email: "david.wilson@example.com",
      avatar: "DW",
      status: "away",
      projects: ["Automated Testing", "Web App Redesign"]
    }
  ];

  const projects = [
    {
      id: 1,
      name: "Web App Redesign",
      progress: 75,
      members: 5,
      status: "in-progress",
      deadline: "2023-11-30"
    },
    {
      id: 2,
      name: "API Integration",
      progress: 40,
      members: 3,
      status: "in-progress",
      deadline: "2023-12-15"
    },
    {
      id: 3,
      name: "Database Migration",
      progress: 90,
      members: 3,
      status: "in-progress",
      deadline: "2023-11-15"
    },
    {
      id: 4,
      name: "Mobile App Design",
      progress: 60,
      members: 2,
      status: "in-progress",
      deadline: "2023-12-10"
    },
    {
      id: 5,
      name: "Automated Testing",
      progress: 30,
      members: 2,
      status: "in-progress",
      deadline: "2023-12-30"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      case "offline":
      default:
        return "bg-gray-400";
    }
  };

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "on-hold":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <DashboardWithSidebar>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Team Overview</h1>
        <p className="text-gray-600">Manage your team members and projects</p>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input className="pl-10" placeholder="Search team members or projects..." />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline">Filter</Button>
          <Button className="bg-purple-600 hover:bg-purple-700">Add Team Member</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-lg">Team Members</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={`https://ui-avatars.com/api/?name=${member.name.replace(" ", "+")}&background=random`} />
                        <AvatarFallback>{member.avatar}</AvatarFallback>
                      </Avatar>
                      <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white ${getStatusColor(member.status)}`} />
                    </div>
                    <div className="ml-3">
                      <p className="font-medium">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.role}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">View</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-lg">Active Projects</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {projects.map((project) => (
                <div key={project.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{project.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{project.members} members</span>
                        <span>•</span>
                        <span>Due {new Date(project.deadline).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className={getProjectStatusColor(project.status)}>
                      {project.status.replace("-", " ")}
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span>{project.progress}% complete</span>
                    <span>{Math.floor((new Date(project.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Team Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-6 border border-dashed rounded-lg">
            <p className="text-gray-500">Team calendar view will be available soon</p>
            <Button className="mt-2 bg-purple-600 hover:bg-purple-700">View Calendar</Button>
          </div>
        </CardContent>
      </Card>
    </DashboardWithSidebar>
  );
};

export default Team;
