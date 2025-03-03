
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Briefcase, Users, ShieldCheck, Mail, Phone, ArrowRight } from "lucide-react";
import CompanyHeader from "../components/CompanyHeader";
import { getCurrentUser } from "../services/authService";
import DashboardWithSidebar from "../components/dashboard/DashboardWithSidebar";
import StatCard from "../components/dashboard/StatCard";
import ChartCard from "../components/dashboard/ChartCard";
import RequestsTable from "../components/dashboard/RequestsTable";
import { Calendar, FileText, Clock, BarChart3, Award } from "lucide-react";

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

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="bg-white/70 backdrop-blur-sm p-6 rounded-lg shadow-md hover:shadow-lg transition-all border border-gray-100">
    <div className="mb-4 text-purple-600">{icon}</div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const TestimonialCard = ({ quote, author, role }: { quote: string, author: string, role: string }) => (
  <div className="bg-white/70 backdrop-blur-sm p-6 rounded-lg shadow-md border border-gray-100">
    <p className="italic text-gray-700 mb-4">"{quote}"</p>
    <div className="font-semibold">{author}</div>
    <div className="text-sm text-gray-600">{role}</div>
  </div>
);

const MarketingFrontPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
      {/* Hero Section */}
      <header className="relative py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <CompanyHeader size="lg" />
        <Link to="/login">
          <Button className="bg-purple-600 hover:bg-purple-700">
            Login
          </Button>
        </Link>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Streamline Your HR Operations with TechPro Solutions
            </h1>
            <p className="text-lg text-gray-700 mb-8">
              Our comprehensive HR portal helps you manage employee data, leave requests, documents, and performance tracking - all in one place.
            </p>
            <div className="flex gap-4">
              <Link to="/login">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1605810230434-7631ac76ec81" 
                alt="HR Team" 
                className="w-full object-cover h-[400px]"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -z-10 -bottom-6 -right-6 w-64 h-64 rounded-full bg-blue-200 opacity-50"></div>
            <div className="absolute -z-10 -top-6 -left-6 w-48 h-48 rounded-full bg-purple-200 opacity-50"></div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-b from-transparent to-white/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Features That Drive Efficiency
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Users className="h-10 w-10" />}
              title="Employee Management" 
              description="Seamlessly manage employee information, documents, and performance metrics."
            />
            <FeatureCard 
              icon={<Calendar className="h-10 w-10" />}
              title="Leave Management" 
              description="Efficiently handle leave requests, approvals, and balance tracking."
            />
            <FeatureCard 
              icon={<Briefcase className="h-10 w-10" />}
              title="Career Development" 
              description="Track and facilitate employee growth, skills, and career progression."
            />
            <FeatureCard 
              icon={<ShieldCheck className="h-10 w-10" />}
              title="Secure Document Storage" 
              description="Securely store and share important HR documents with proper access controls."
            />
            <FeatureCard 
              icon={<BarChart3 className="h-10 w-10" />}
              title="Analytics Dashboard" 
              description="Gain insights with comprehensive reports and performance analytics."
            />
            <FeatureCard 
              icon={<Award className="h-10 w-10" />}
              title="Recognition & Rewards" 
              description="Acknowledge employee achievements and implement reward programs."
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            What Our Clients Say
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <TestimonialCard 
              quote="TechPro's HR portal has revolutionized how we manage our team. The time saved on administrative tasks alone has been worth the investment."
              author="Sarah Johnson"
              role="HR Director, Innovatech"
            />
            <TestimonialCard 
              quote="The analytics dashboard provides invaluable insights that help us make data-driven decisions about our workforce planning."
              author="Michael Chen"
              role="COO, Nexus Systems"
            />
            <TestimonialCard 
              quote="Implementation was smooth and the support team has been exceptional. Our employees love the user-friendly interface."
              author="Lisa Rodriguez"
              role="People Operations, GrowthWave"
            />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gradient-to-b from-transparent to-white/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Ready to Transform Your HR Operations?
          </h2>
          
          <div className="flex flex-col md:flex-row justify-center items-center gap-8">
            <div className="flex items-center gap-3">
              <Mail className="h-6 w-6 text-purple-600" />
              <span className="text-gray-700">contact@techprosolutions.com</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-6 w-6 text-purple-600" />
              <span className="text-gray-700">+1 (555) 123-4567</span>
            </div>
            <Link to="/login">
              <Button className="bg-purple-600 hover:bg-purple-700">
                Get Started Today
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

const Index = () => {
  const currentUser = getCurrentUser();
  
  // If user is logged in, show the dashboard
  if (currentUser) {
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
  }
  
  // If not logged in, show the marketing front page
  return <MarketingFrontPage />;
};

export default Index;
