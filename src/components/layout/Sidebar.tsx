
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, BookOpen, Layers, Folder, FileText, LogOut, ChevronLeft, ChevronRight, BookText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  isActive: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, isActive, onClick }) => {
  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-2 text-sidebar-foreground hover:bg-white/10 hover:text-white",
        isActive && "sidebar-item-active"
      )}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </Button>
  );
};

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const isMobile = useIsMobile();

  const sidebarItems = [
    { icon: <BookOpen size={18} />, label: "Boards", path: "/boards" },
    { icon: <Layers size={18} />, label: "Classes", path: "/classes" },
    { icon: <Folder size={18} />, label: "Subjects", path: "/subjects" },
    { icon: <FileText size={18} />, label: "Chapters", path: "/chapters" },
    { icon: <Menu size={18} />, label: "Topics", path: "/topics" },
    { icon: <BookText size={18} />, label: "Questions", path: "/questions" },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setCollapsed(true);
    }
  };

  const toggleSidebar = () => {
    setCollapsed((prev) => !prev);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && !collapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20" 
          onClick={() => setCollapsed(true)}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed top-0 bottom-0 z-30 flex flex-col bg-sidebar transition-all duration-300 ease-in-out",
        collapsed 
          ? (isMobile ? "w-0 -left-16" : "w-16") 
          : (isMobile ? "w-64 left-0" : "w-64")
      )}>
        <div className="p-4 flex items-center justify-between">
          {!collapsed && <h1 className="text-xl font-bold text-white">Edu Data Hub</h1>}
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-white/10 ml-auto"
            onClick={toggleSidebar}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-2">
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <SidebarItem
                key={item.path}
                icon={item.icon}
                label={item.label}
                path={item.path}
                isActive={location.pathname === item.path}
                onClick={() => handleNavigation(item.path)}
              />
            ))}
          </div>
        </div>
        
        <Button
          variant="ghost"
          className="mx-2 mb-4 justify-start gap-2 text-sidebar-foreground hover:bg-white/10 hover:text-white"
          onClick={logout}
        >
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
      
      {/* Toggle button for mobile */}
      {isMobile && collapsed && (
        <Button
          variant="outline"
          size="icon"
          className="fixed top-4 left-4 z-20 bg-white shadow-md"
          onClick={toggleSidebar}
        >
          <Menu size={18} />
        </Button>
      )}
    </>
  );
};

export default Sidebar;
