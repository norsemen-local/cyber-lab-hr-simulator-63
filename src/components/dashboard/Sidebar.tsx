import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import CompanyHeader from "../CompanyHeader";
import { 
  Home, 
  User, 
  FileText, 
  Calendar, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  ChevronDown,
  Bell,
  BarChart3,
  Mail,
  HelpCircle
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "../../services/authService";
import { useToast } from "@/components/ui/use-toast";

interface SubItem {
  label: string;
  path: string;
}

interface MenuItemProps {
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

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    navigate("/login");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out transform border-r",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex h-screen flex-col">
        <div className="flex h-14 items-center border-b px-4">
          <CompanyHeader />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="ml-auto h-8 w-8"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
        
        <ScrollArea className="flex-1 px-3 py-4">
          <div className="space-y-1">
            <MenuItem 
              icon={<Home className="h-5 w-5" />} 
              label="Dashboard" 
              path="/"
            />
            
            <MenuItem 
              icon={<User className="h-5 w-5" />} 
              label="My Profile" 
              path="/profile"
              subItems={[
                { label: "Personal Info", path: "/profile/personal" },
                { label: "Career History", path: "/profile/career" },
                { label: "Documents", path: "/profile/documents" },
              ]}
              activePathMatches={["/profile"]}
            />
            
            <MenuItem 
              icon={<Calendar className="h-5 w-5" />} 
              label="Time Management" 
              path="/time"
              subItems={[
                { label: "Leave Requests", path: "/time/leave" },
                { label: "Attendance", path: "/time/attendance" },
                { label: "Timesheet", path: "/time/timesheet" },
              ]}
              activePathMatches={["/time"]}
            />
            
            <MenuItem 
              icon={<BarChart3 className="h-5 w-5" />} 
              label="Performance" 
              path="/performance"
              subItems={[
                { label: "Goals", path: "/performance/goals" },
                { label: "Reviews", path: "/performance/reviews" },
                { label: "Skills", path: "/performance/skills" },
              ]}
              activePathMatches={["/performance"]}
            />
            
            <MenuItem 
              icon={<FileText className="h-5 w-5" />} 
              label="Documents" 
              path="/documents"
            />
            
            <MenuItem 
              icon={<Users className="h-5 w-5" />} 
              label="Team" 
              path="/team"
              subItems={[
                { label: "Members", path: "/team/members" },
                { label: "Projects", path: "/team/projects" },
                { label: "Calendar", path: "/team/calendar" },
              ]}
              activePathMatches={["/team"]}
            />
            
            <MenuItem 
              icon={<Bell className="h-5 w-5" />} 
              label="Notifications" 
              path="/notifications"
            />
            
            <MenuItem 
              icon={<Mail className="h-5 w-5" />} 
              label="Messages" 
              path="/messages"
            />
            
            <MenuItem 
              icon={<Settings className="h-5 w-5" />} 
              label="Settings" 
              path="/settings"
            />
            
            <MenuItem 
              icon={<HelpCircle className="h-5 w-5" />} 
              label="Help & Support" 
              path="/help"
            />
          </div>
        </ScrollArea>
        
        <div className="border-t p-4">
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
