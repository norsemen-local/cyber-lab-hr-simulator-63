
import { ScrollArea } from "@/components/ui/scroll-area";
import MenuItem from "./MenuItem";
import { 
  Home, 
  User, 
  FileText, 
  Calendar, 
  Users, 
  Settings, 
  Bell,
  BarChart3,
  Mail,
  HelpCircle
} from "lucide-react";

const SidebarMenu = () => {
  return (
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
  );
};

export default SidebarMenu;
