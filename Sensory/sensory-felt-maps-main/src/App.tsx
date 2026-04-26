import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SensoryProvider } from "@/context/SensoryContext";
import { BootSplash } from "@/components/BootSplash";
import Index from "./pages/Index.tsx";
import Onboarding from "./pages/Onboarding.tsx";
import MapPage from "./pages/Map.tsx";
import Settings from "./pages/Settings.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => {
  const [booting, setBooting] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <SensoryProvider>
        <TooltipProvider>
          {booting && <BootSplash onDone={() => setBooting(false)} />}
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/settings" element={<Settings />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SensoryProvider>
    </QueryClientProvider>
  );
};

export default App;
