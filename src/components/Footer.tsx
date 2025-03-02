
import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full py-4 text-center text-sm text-gray-500 bg-transparent relative">
      {/* Symmetrical divider line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
      
      <p>© {currentYear} Technical Product Enablement Team. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
