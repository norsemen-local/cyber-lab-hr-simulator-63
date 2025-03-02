
import { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-[calc(100vh-49px)] bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-8 relative overflow-hidden">
      {/* Geometric shapes for visual interest */}
      <div className="absolute top-0 left-0 w-64 h-64 rounded-br-full bg-blue-100 opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-tl-full bg-purple-100 opacity-50"></div>
      <div className="absolute top-1/4 right-1/4 w-40 h-40 rounded-full bg-yellow-100 opacity-40"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
