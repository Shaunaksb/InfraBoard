import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useUsers } from "@/hooks/useUsers";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import UserPreferences from "./pages/UserPreferences";
import Organizations from "./pages/Organizations";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ShareRedirect from "./pages/ShareRedirect";
import { ThemeProvider } from "@/components/theme-provider";
import { useTheme } from "next-themes";
import { useEffect } from "react";

const queryClient = new QueryClient();

// A wrapper component that redirects to /login if user is not authenticated
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, isLoading } = useUsers();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Component to dynamically sync the API user preferences with next-themes
const ThemeSync = () => {
  const { currentUser } = useUsers();
  const { setTheme, theme } = useTheme();

  useEffect(() => {
    if (currentUser?.preferences?.theme && currentUser.preferences.theme !== theme) {
      setTheme(currentUser.preferences.theme);
    }
  }, [currentUser?.preferences?.theme, setTheme, theme]);

  return null;
};

const App = () => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <ThemeSync />
          <BrowserRouter>
            <Routes>
              {/* Public Authentication Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Referral Onboarding Route */}
              <Route path="/share/:boardId" element={<ShareRedirect />} />

              {/* Protected Application Routes */}
              <Route path="/" element={<PrivateRoute><Index /></PrivateRoute>} />
              <Route path="/user-preferences" element={<PrivateRoute><UserPreferences /></PrivateRoute>} />
              <Route path="/organizations" element={<PrivateRoute><Organizations /></PrivateRoute>} />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
