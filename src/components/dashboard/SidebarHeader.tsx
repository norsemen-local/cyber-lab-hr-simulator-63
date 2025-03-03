
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import CompanyHeader from "../CompanyHeader";

interface SidebarHeaderProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const SidebarHeader = ({ isOpen, toggleSidebar }: SidebarHeaderProps) => {
  return (
    <div className="flex h-14 items-center border-b px-4">
      <CompanyHeader />
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="ml-auto h-8 w-8"
      >
        <Menu className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default SidebarHeader;
