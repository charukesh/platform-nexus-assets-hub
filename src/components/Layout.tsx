
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, Database, FileImage, BarChart4, Settings, PlusCircle } from "lucide-react";

const navItems = [
  { name: "Dashboard", path: "/", icon: Home },
  { name: "Platforms", path: "/platforms", icon: Database },
  { name: "Assets", path: "/assets", icon: FileImage },
  { name: "Analytics", path: "/analytics", icon: BarChart4 },
  { name: "Settings", path: "/settings", icon: Settings },
];

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-neugray-100">
      {/* Sidebar */}
      <aside className="w-64 p-6">
        <div className="neu-flat p-4 mb-8">
          <h1 className="text-xl font-bold text-center text-primary">Platform Nexus</h1>
        </div>
        
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={cn(
                  "flex items-center p-3 rounded-lg transition-all duration-200",
                  isActive 
                    ? "neu-pressed text-primary" 
                    : "neu-flat hover:shadow-neu-pressed"
                )}
              >
                <Icon size={18} className="mr-2" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-8">
          <Link 
            to="/platforms/new" 
            className="flex items-center justify-center p-3 text-primary neu-flat hover:shadow-neu-pressed rounded-lg transition-all duration-200"
          >
            <PlusCircle size={18} className="mr-2" />
            <span>Add Platform</span>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;
