
import DashboardWithSidebar from "../components/dashboard/DashboardWithSidebar";
import StatCard from "../components/dashboard/StatCard";
import ChartCard from "../components/dashboard/ChartCard";
import RequestsTable from "../components/dashboard/RequestsTable";
import { Calendar, Users, FileText, Clock, BarChart3, Briefcase, Award } from "lucide-react";
import { getCurrentUser } from "../services/authService";

// Mock data for charts
const projectProgressData = [
  { name: "Jan", value: 20 },
  { name: "Feb", value: 35 },
  { name: "Mar", value: 28 },
  { name: "Apr", value: 45 },
  { name: "May", value: 50 },
  { name: "Jun", value: 65 },
  { name: "Jul", value: 75 },
  { name: "Aug", value: 82 }
];

const teamPerformanceData = [
  { name: "Team A", value: 78 },
  { name: "Team B", value: 65 },
  { name: "Team C", value: 82 },
  { name: "Team D", value: 70 },
  { name: "Team E", value: 85 }
];

const Index = () => {
  const currentUser = getCurrentUser();
  
  if (!currentUser) {
    return null; // This will be handled by the DashboardWithSidebar component
  }
  
  return (
    <DashboardWithSidebar>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {currentUser.name}</h1>
        <p className="text-gray-600">Here's your HR dashboard overview</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Leave Balance" 
          value="15 days" 
          icon={<Calendar className="h-5 w-5 text-purple-600" />}
          trend={{ value: 0, isPositive: true }}
        />
        <StatCard 
          title="Team Members" 
          value="8" 
          icon={<Users className="h-5 w-5 text-blue-600" />}
          trend={{ value: 2, isPositive: true }}
        />
        <StatCard 
          title="Pending Tasks" 
          value="12" 
          icon={<Clock className="h-5 w-5 text-yellow-600" />}
          trend={{ value: 5, isPositive: false }}
        />
        <StatCard 
          title="Documents" 
          value="34" 
          icon={<FileText className="h-5 w-5 text-green-600" />}
          trend={{ value: 12, isPositive: true }}
        />
      </div>
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard 
          title="Project Progress"
          chartType="line"
          data={projectProgressData}
          dataKey="value"
          height={250}
        />
        <ChartCard 
          title="Team Performance"
          chartType="bar"
          data={teamPerformanceData}
          dataKey="value"
          height={250}
        />
      </div>
      
      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard 
          title="Performance Score" 
          value="87/100" 
          icon={<BarChart3 className="h-5 w-5 text-indigo-600" />}
          description="You're in the top 15% of your department"
        />
        <StatCard 
          title="Ongoing Projects" 
          value="3" 
          icon={<Briefcase className="h-5 w-5 text-orange-600" />}
          description="2 due this month"
        />
        <StatCard 
          title="Achievements" 
          value="5" 
          icon={<Award className="h-5 w-5 text-pink-600" />}
          description="2 new this quarter"
        />
      </div>
      
      {/* Requests Table */}
      <div className="mb-6">
        <RequestsTable />
      </div>
    </DashboardWithSidebar>
  );
};

export default Index;
