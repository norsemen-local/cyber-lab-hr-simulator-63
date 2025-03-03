
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export interface SubItem {
  label: string;
  path: string;
}

export interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  path?: string;
  subItems?: SubItem[];
  activePathMatches?: string[];
}

const MenuItem = ({ icon, label, path, subItems, activePathMatches = [] }: MenuItemProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(() => {
    if (subItems) {
      return subItems.some(item => location.pathname.startsWith(item.path));
    }
    return false;
  });

  const isActive = path ? 
    location.pathname === path || location.pathname.startsWith(path) : 
    activePathMatches.some(match => location.pathname.startsWith(match));

  const handleClick = () => {
    if (subItems && subItems.length > 0) {
      setIsExpanded(!isExpanded);
    } else if (path) {
      navigate(path);
    }
  };

  return (
    <div className="mb-1">
      <Button
        variant="ghost"
        onClick={handleClick}
        className={cn(
          "w-full justify-start px-3 relative hover:bg-sidebar-accent hover:bg-gray-100",
          isActive ? "bg-gray-100 text-purple-700 font-medium" : "",
        )}
      >
        <span className="flex items-center">
          {icon}
          <span className="ml-3">{label}</span>
        </span>
        {subItems && subItems.length > 0 && (
          <ChevronDown 
            className={cn(
              "h-4 w-4 absolute right-2 transition-transform",
              isExpanded ? "rotate-180" : ""
            )} 
          />
        )}
      </Button>
      
      {subItems && isExpanded && (
        <div className="ml-10 mt-1 space-y-1">
          {subItems.map((item, index) => {
            const isSubItemActive = location.pathname === item.path || location.pathname.startsWith(item.path);
            
            return (
              <Button
                key={index}
                variant="ghost"
                onClick={() => navigate(item.path)}
                className={cn(
                  "w-full justify-start h-8 px-2 text-sm font-normal",
                  isSubItemActive ? "bg-gray-100 text-purple-700 font-medium" : ""
                )}
              >
                {item.label}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MenuItem;
