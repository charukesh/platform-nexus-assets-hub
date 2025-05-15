
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
import React, { useEffect } from "react";
import PageTransition from "./components/PageTransition";

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
    }, 1000); // Match this with our transition duration
    
    return () => {
      clearTimeout(timeout);
      document.body.classList.remove('route-changing');
    };
  }, [location.pathname]);
  
  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<PageTransition><Dashboard /></PageTransition>} />
      <Route path="/platforms" element={<PageTransition><Platforms /></PageTransition>} />
      <Route path="/platforms/new" element={<PageTransition><PlatformForm /></PageTransition>} />
      <Route path="/platforms/:id" element={<PageTransition><PlatformDetail /></PageTransition>} />
      <Route path="/platforms/:id/edit" element={<PageTransition><PlatformForm /></PageTransition>} />
      <Route path="/assets" element={<PageTransition><AssetsManagement /></PageTransition>} />
      <Route path="/assets/new" element={<PageTransition><AssetForm /></PageTransition>} />
      <Route path="/assets/:id" element={<PageTransition><AssetDetail /></PageTransition>} />
      <Route path="/assets/:id/edit" element={<PageTransition><AssetForm /></PageTransition>} />
      <Route path="/analytics" element={<PageTransition><Analytics /></PageTransition>} />
      <Route path="/media-plan" element={<PageTransition><MediaPlanGenerator /></PageTransition>} />
      <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
    </Routes>
  );
};

const App = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="mobistack-theme">
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AnimatedRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
