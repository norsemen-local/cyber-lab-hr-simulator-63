
import React from "react";
import CompanyHeader from "./CompanyHeader";
import DatabaseStats from "./DatabaseStats";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full py-6 text-center text-sm text-gray-500 bg-transparent relative">
      {/* Symmetrical divider line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex flex-col items-center lg:items-start gap-1">
          <CompanyHeader size="sm" />
          <p>© {currentYear} TechPro Solutions. All rights reserved.</p>
        </div>
        
        <DatabaseStats />
      </div>
    </footer>
  );
};

export default Footer;
