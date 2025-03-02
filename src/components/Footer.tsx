
import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full py-3 text-center text-sm text-gray-500 bg-white/80 backdrop-blur-sm border-t">
      <p>© {currentYear} Technical Product Enablement Team. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
