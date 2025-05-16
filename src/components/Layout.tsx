
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, Database, FileImage, BarChart4, Settings, Menu, X, Shield, LogOut } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import Disclaimer from "@/components/Disclaimer";
import PageTransition from "@/components/PageTransition";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "./ui/button";

const navItems = [
  {
    name: "Create Plan", 
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
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = React.useState(!isMobile);
  const { theme } = useTheme();
  const { isAdmin, user, signOut } = useAuth();

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

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className={cn(
      "min-h-screen flex bg-neugray-100 dark:bg-gray-900 transition-colors duration-700",
    )}>
      {/* Mobile menu toggle */}
      {isMobile && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-4 left-4 z-50 p-2 neu-flat dark:bg-gray-800 rounded-full"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "w-64 p-6 transition-all duration-300 z-40 dark:bg-gray-900",
          isMobile && (
            sidebarOpen
              ? "fixed inset-y-0 left-0 transform translate-x-0"
              : "fixed inset-y-0 left-0 transform -translate-x-full"
          )
        )}
      >
        <div className="neu-flat dark:bg-gray-800 dark:text-white p-4 mb-8 flex items-center justify-center transition-all duration-300">
          <img 
            src="/lovable-uploads/d8b438e7-71aa-4140-9e46-a826b575f9a5.png" 
            alt="MobiStackIO Logo" 
            className="h-12 w-auto" 
          />
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
                  "flex items-center p-3 rounded-lg transition-all duration-300",
                  active 
                    ? "neu-pressed text-primary dark:bg-gray-800 dark:text-blue-400 font-medium" 
                    : "neu-flat hover:shadow-neu-pressed dark:bg-gray-800 dark:hover:bg-gray-700"
                )}
              >
                <Icon size={18} className={cn("mr-2", active ? "text-primary dark:text-blue-400" : "")} />
                <span>{item.name}</span>
              </Link>
            );
          })}

          {/* Admin link - only shown if user is admin */}
          {isAdmin && (
            <Link
              to="/admin"
              className={cn(
                "flex items-center p-3 rounded-lg transition-all duration-300",
                isActive("/admin") 
                  ? "neu-pressed text-primary dark:bg-gray-800 dark:text-blue-400 font-medium" 
                  : "neu-flat hover:shadow-neu-pressed dark:bg-gray-800 dark:hover:bg-gray-700"
              )}
            >
              <Shield size={18} className={cn("mr-2", isActive("/admin") ? "text-primary dark:text-blue-400" : "")} />
              <span>Admin</span>
            </Link>
          )}
        </nav>

        <div className="mt-8 space-y-4">
          {/* User info and logout */}
          {user && (
            <div className="neu-flat dark:bg-gray-800 p-3 rounded-lg">
              <div className="text-sm font-medium truncate mb-2">{user.email}</div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full flex items-center justify-center gap-2"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </Button>
            </div>
          )}
          
          <div className="flex justify-end">
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main
        className={cn(
          "flex-1 p-4 md:p-8 overflow-auto dark:bg-gray-900 dark:text-white transition-colors duration-700",
          isMobile && sidebarOpen ? "ml-64" : "",
          isMobile && !sidebarOpen ? "w-full" : "",
          "pb-12" // Added padding to bottom to make space for the disclaimer
        )}
      >
        {/* Mobile top spacing when menu is collapsed */}
        {isMobile && !sidebarOpen && <div className="h-12"></div>}
        <PageTransition>
          {children}
        </PageTransition>
      </main>

      {/* Disclaimer strip */}
      <Disclaimer />
    </div>
  );
};

export default Layout;
