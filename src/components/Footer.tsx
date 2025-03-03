
import React from "react";
import CompanyHeader from "./CompanyHeader";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full py-4 text-center text-sm text-gray-500 bg-transparent relative">
      {/* Symmetrical divider line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
      
      <div className="flex flex-col items-center justify-center gap-1">
        <CompanyHeader size="sm" />
        <p>© {currentYear} TechPro Solutions. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
