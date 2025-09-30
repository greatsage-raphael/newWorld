
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Transit from "./pages/Transit";
import Offloading from "./pages/Offloading";
import Admin from "./pages/Admin";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import SuperAdmin from "./components/SuperAdmin";
import SuperAdminLogin from "./components/SuperAdminLogin";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import ProtectedSuperAdminRoute from "./components/ProtectedSuperAdminRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route 
            path="/transit" 
            element={
              <ProtectedRoute>
                <Transit />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/offloading/:slug" 
            element={
              <ProtectedRoute>
                <Offloading />
              </ProtectedRoute>
            } 
          />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            } 
          />
          <Route path="/admin/superadmin/login" element={<SuperAdminLogin />} />
          <Route 
            path="/admin/superadmin" 
            element={
              <ProtectedSuperAdminRoute>
                <SuperAdmin />
              </ProtectedSuperAdminRoute>
            } 
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
