
import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const AppLayout: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className={cn(
        "transition-all duration-300 min-h-screen bg-gray-50",
        isMobile ? "pl-0" : "pl-64"
      )}>
        <div className="container mx-auto py-8 px-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
