
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, Database, FileImage, BarChart4, Settings, Menu, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const navItems = [
  {
    name: "Dashboard",
    path: "/",
    icon: Home
  },
  {
    name: "Platforms",
    path: "/platforms",
    icon: Database
  },
  {
    name: "Assets",
    path: "/assets",
    icon: FileImage
  },
  {
    name: "Analytics",
    path: "/analytics",
    icon: BarChart4
  },
  {
    name: "Settings",
    path: "/settings",
    icon: Settings
  }
];

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = React.useState(!isMobile);

  React.useEffect(() => {
    // Close sidebar on mobile when changing routes
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') {
      return true;
    }
    if (path !== '/' && location.pathname.startsWith(path)) {
      return true;
    }
    return false;
  };

  return (
    <div className="min-h-screen flex bg-neugray-100">
      {/* Mobile menu toggle */}
      {isMobile && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-4 left-4 z-50 p-2 neu-flat rounded-full"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "w-64 p-6 transition-all duration-300 z-40",
          isMobile && (
            sidebarOpen
              ? "fixed inset-y-0 left-0 transform translate-x-0"
              : "fixed inset-y-0 left-0 transform -translate-x-full"
          )
        )}
      >
        <div className="neu-flat p-4 mb-8">
          <h1 className="text-xl font-bold text-center text-primary">MobistackIO</h1>
        </div>
        
        <nav className="space-y-2">
          {navItems.map(item => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center p-3 rounded-lg transition-all duration-200",
                  active 
                    ? "neu-pressed text-primary font-medium bg-white" 
                    : "neu-flat hover:shadow-neu-pressed"
                )}
              >
                <Icon size={18} className={cn("mr-2", active ? "text-primary" : "")} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-8"></div>
      </aside>

      {/* Main content */}
      <main
        className={cn(
          "flex-1 p-4 md:p-8 overflow-auto",
          isMobile && sidebarOpen ? "ml-64" : "",
          isMobile && !sidebarOpen ? "w-full" : ""
        )}
      >
        {/* Mobile top spacing when menu is collapsed */}
        {isMobile && !sidebarOpen && <div className="h-12"></div>}
        {children}
      </main>
    </div>
  );
};

export default Layout;
