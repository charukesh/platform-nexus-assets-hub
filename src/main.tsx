
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Toaster } from "@/components/ui/toaster";

// Create a theme transition overlay element
const createThemeTransitionOverlay = () => {
  const overlay = document.createElement('div');
  overlay.className = 'theme-transition-overlay';
  document.body.appendChild(overlay);
  return overlay;
};

// Set up theme change listener
document.addEventListener('DOMContentLoaded', () => {
  const themeOverlay = createThemeTransitionOverlay();
  
  // Listen for theme changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (
        mutation.attributeName === 'class' &&
        (mutation.target as HTMLElement).classList.contains('dark') !== 
        document.documentElement.classList.contains('dark')
      ) {
        // Theme is changing, activate overlay
        themeOverlay.classList.add('active');
        
        // Remove overlay after transition completes
        setTimeout(() => {
          themeOverlay.classList.remove('active');
        }, 1000);
      }
    });
  });
  
  observer.observe(document.documentElement, { attributes: true });
});

createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <Toaster />
  </>
);
