
import { cn } from "@/lib/utils";
import SidebarHeader from "./SidebarHeader";
import SidebarMenu from "./SidebarMenu";
import SidebarFooter from "./SidebarFooter";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out transform border-r",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex h-screen flex-col">
        <SidebarHeader isOpen={isOpen} toggleSidebar={toggleSidebar} />
        <SidebarMenu />
        <SidebarFooter />
      </div>
    </div>
  );
};

export default Sidebar;
