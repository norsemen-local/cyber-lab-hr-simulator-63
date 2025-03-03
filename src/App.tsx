
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Team from "./pages/Team";
import TimeManagement from "./pages/TimeManagement";
import DocumentUpload from "./pages/DocumentUpload";
import Footer from "./components/Footer";
import { useEffect } from "react";
import CompanyHeader from "./components/CompanyHeader";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    console.log("App component mounted");
    
    // Add app title with company name
    document.title = "TechPro Solutions - HR Portal";
    
    // Get favicon link element
    const favicon = document.querySelector("link[rel='icon']");
    if (favicon) {
      // Update favicon to purple (simulating company branding)
      favicon.setAttribute("href", "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='0.9em' font-size='90' x='50%' text-anchor='middle' dominant-baseline='middle' fill='purple'>T</text></svg>");
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="flex flex-col min-h-screen">
            <div className="flex-grow">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/:tab" element={<Profile />} />
                <Route path="/team" element={<Team />} />
                <Route path="/team/:tab" element={<Team />} />
                <Route path="/time/*" element={<TimeManagement />} />
                <Route path="/documents" element={<DocumentUpload />} />
                {/* Redirect /register to /login */}
                <Route path="/register" element={<Navigate to="/login" />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
