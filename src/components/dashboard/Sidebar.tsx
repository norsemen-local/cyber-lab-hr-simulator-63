
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  HelpCircle,
  Building2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../services/authService";
import { useToast } from "@/components/ui/use-toast";

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
  subItems?: { label: string; onClick?: () => void }[];
}

const MenuItem = ({ icon, label, onClick, active, subItems }: MenuItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = () => {
    if (subItems && subItems.length > 0) {
      setIsExpanded(!isExpanded);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <div className="mb-1">
      <Button
        variant="ghost"
        onClick={handleClick}
        className={cn(
          "w-full justify-start px-3 relative hover:bg-sidebar-accent",
          active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "",
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
          {subItems.map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              onClick={item.onClick}
              className="w-full justify-start h-8 px-2 text-sm font-normal"
            >
              {item.label}
            </Button>
          ))}
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
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-purple-600" />
            <h2 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              HR Portal
            </h2>
          </div>
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
              active={true}
              onClick={() => navigate("/")} 
            />
            
            <MenuItem 
              icon={<User className="h-5 w-5" />} 
              label="My Profile" 
              onClick={() => navigate("/profile")}
              subItems={[
                { label: "Personal Info", onClick: () => navigate("/profile/personal") },
                { label: "Career History", onClick: () => navigate("/profile/career") },
                { label: "Documents", onClick: () => navigate("/profile/documents") },
              ]}
            />
            
            <MenuItem 
              icon={<Calendar className="h-5 w-5" />} 
              label="Time Management" 
              subItems={[
                { label: "Leave Requests", onClick: () => navigate("/time/leave") },
                { label: "Attendance", onClick: () => navigate("/time/attendance") },
                { label: "Timesheet", onClick: () => navigate("/time/timesheet") },
              ]}
            />
            
            <MenuItem 
              icon={<BarChart3 className="h-5 w-5" />} 
              label="Performance" 
              subItems={[
                { label: "Goals", onClick: () => navigate("/performance/goals") },
                { label: "Reviews", onClick: () => navigate("/performance/reviews") },
                { label: "Skills", onClick: () => navigate("/performance/skills") },
              ]}
            />
            
            <MenuItem 
              icon={<FileText className="h-5 w-5" />} 
              label="Documents" 
              onClick={() => navigate("/documents")}
            />
            
            <MenuItem 
              icon={<Users className="h-5 w-5" />} 
              label="Team" 
              onClick={() => navigate("/team")}
              subItems={[
                { label: "Members", onClick: () => navigate("/team/members") },
                { label: "Projects", onClick: () => navigate("/team/projects") },
                { label: "Calendar", onClick: () => navigate("/team/calendar") },
              ]}
            />
            
            <MenuItem 
              icon={<Bell className="h-5 w-5" />} 
              label="Notifications" 
              onClick={() => navigate("/notifications")}
            />
            
            <MenuItem 
              icon={<Mail className="h-5 w-5" />} 
              label="Messages" 
              onClick={() => navigate("/messages")}
            />
            
            <MenuItem 
              icon={<Settings className="h-5 w-5" />} 
              label="Settings" 
              onClick={() => navigate("/settings")}
            />
            
            <MenuItem 
              icon={<HelpCircle className="h-5 w-5" />} 
              label="Help & Support" 
              onClick={() => navigate("/help")}
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
