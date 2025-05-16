
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import Dashboard from "./pages/Index";
import Platforms from "./pages/Platforms";
import PlatformForm from "./pages/PlatformForm";
import PlatformDetail from "./pages/PlatformDetail";
import AssetsManagement from "./pages/AssetsManagement";
import AssetForm from "./pages/AssetForm";
import AssetDetail from "./pages/AssetDetail";
import Analytics from "./pages/Analytics";
import MediaPlanGenerator from "./pages/MediaPlanGenerator";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import React, { useEffect } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import AuthGuard from "./components/AuthGuard";

// Create the query client outside the component
const queryClient = new QueryClient();

// AnimatedRoutes component to handle route transitions
const AnimatedRoutes = () => {
  const location = useLocation();
  
  // Add a class to the body when route changes to help with transitions
  useEffect(() => {
    document.body.classList.add('route-changing');
    
    const timeout = setTimeout(() => {
      document.body.classList.remove('route-changing');
    }, 700); // Match this with our transition duration
    
    return () => {
      clearTimeout(timeout);
      document.body.classList.remove('route-changing');
    };
  }, [location.pathname]);
  
  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/login" element={<Login />} />

      {/* Dashboard - accessible to all logged in users */}
      <Route path="/" element={<AuthGuard><Dashboard /></AuthGuard>} />
      
      {/* Platforms - viewable by all, but editable by admins and media managers */}
      <Route path="/platforms" element={<AuthGuard><Platforms /></AuthGuard>} />
      <Route path="/platforms/new" element={<AuthGuard requiredRole="media_manager"><PlatformForm /></AuthGuard>} />
      <Route path="/platforms/:id" element={<AuthGuard><PlatformDetail /></AuthGuard>} />
      <Route path="/platforms/:id/edit" element={<AuthGuard requiredRole="media_manager"><PlatformForm /></AuthGuard>} />
      
      {/* Assets - viewable by all, but editable by admins and media managers */}
      <Route path="/assets" element={<AuthGuard><AssetsManagement /></AuthGuard>} />
      <Route path="/assets/new" element={<AuthGuard requiredRole="media_manager"><AssetForm /></AuthGuard>} />
      <Route path="/assets/:id" element={<AuthGuard><AssetDetail /></AuthGuard>} />
      <Route path="/assets/:id/edit" element={<AuthGuard requiredRole="media_manager"><AssetForm /></AuthGuard>} />
      
      {/* Analytics - accessible to all logged in users */}
      <Route path="/analytics" element={<AuthGuard><Analytics /></AuthGuard>} />
      
      {/* Media Plan Generator - accessible to all logged in users */}
      <Route path="/media-plan" element={<AuthGuard><MediaPlanGenerator /></AuthGuard>} />
      
      {/* Settings - accessible to all logged in users */}
      <Route path="/settings" element={<AuthGuard><Settings /></AuthGuard>} />
      
      {/* Admin route - requires admin role */}
      <Route path="/admin" element={<AuthGuard requireAdmin={true}><Admin /></AuthGuard>} />
      
      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="mobistack-theme">
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AnimatedRoutes />
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
