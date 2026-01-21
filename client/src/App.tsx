import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useDevTools } from "@/hooks/useDevTools";

// Layouts
import { MainLayout, AuthLayout } from "@/components/layout";

// Route Guards
import { ProtectedRoute, PublicRoute, OTPVerifyRoute, AuthInitializer } from "@/routes";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Pages
import Index from "./pages/Index";
import LandingPage from "./pages/LandingPage";
import TermsOfService from "./pages/TermsOfService";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { OTPLogin } from "./pages/OTPLogin";
import VerifyOtp from "@/pages/VerifyOtp";
import Dashboard from "./pages/Dashboard";
import ChatPage from "./pages/ChatPage";
import ProjectSettings from "./pages/ProjectSettings";
import Profile from "./pages/Profile";
import SecurityPage from "./pages/Settings/SecurityPage";
import PreferencesPage from "./pages/Settings/PreferencesPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (was cacheTime)
    },
  },
});

/**
 * App Component
 * 
 * Root component with complete routing setup:
 * 
 * Route Structure:
 * ├── PUBLIC ROUTES (via PublicRoute guard)
 * │   ├── /                → Landing page
 * │   ├── /login           → Login page
 * │   ├── /register        → Register page
 * │   └── /otp-login       → OTP login
 * │
 * ├── PROTECTED ROUTES (via ProtectedRoute guard)
 * │   ├── /dashboard       → Main dashboard
 * │   ├── /projects        → Projects list
 * │   ├── /chat/:projectId → Chat interface
 * │   ├── /settings        → Project settings
 * │   └── /profile         → User profile
 * │
 * └── CATCH-ALL
 *     └── /*               → 404 Not Found
 * 
 * Security:
 * - AuthInitializer validates token on app mount
 * - PublicRoute prevents logged-in users from accessing auth pages
 * - ProtectedRoute requires authentication for protected pages
 * - Token refresh handled automatically
 * - 401 responses trigger logout
 */
function App() {
  // Initialize dev tools for debugging (development only)
  useDevTools();
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />

          <AuthInitializer>
            <BrowserRouter>
              <Routes>
                {/* ============ PUBLIC ROUTES ============ */}
                {/* Landing page - no auth needed */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/terms" element={<TermsOfService />} />

                {/* Auth routes - wrapped with PublicRoute guard */}
                {/* PublicRoute redirects authenticated users to /dashboard */}
                <Route element={<PublicRoute />}>
                  <Route element={<AuthLayout />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/otp-login" element={<OTPLogin />} />
                  </Route>
                </Route>

                {/* OTP Verification route - protected by OTPVerifyRoute guard */}
                {/* OTPVerifyRoute ensures otpSent === true and otpEmail/otpMode exist */}
                {/* Handles both registration and login OTP verification */}
                <Route element={<OTPVerifyRoute />}>
                  <Route element={<AuthLayout />}>
                    <Route path="/verify-otp" element={<VerifyOtp />} />
                  </Route>
                </Route>

                {/* ============ PROTECTED ROUTES ============ */}
                {/* All routes here require authentication - DISABLED FOR NOW */}
                {/* ProtectedRoute checks isAuthenticated and redirects to /login if needed */}
                {/* <Route element={<ProtectedRoute />}> */}
                <Route element={<MainLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/projects/:projectId/chat" element={<ChatPage />} />
                  <Route path="/projects/:projectId/settings" element={<ProjectSettings />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings/security" element={<SecurityPage />} />
                  <Route path="/settings/preferences" element={<PreferencesPage />} />
                </Route>
                {/* Password Reset Route - Uses AuthLayout instead of MainLayout */}
                <Route element={<AuthLayout />}>
                  <Route path="/reset-password" element={<ResetPassword />} />
                </Route>
                {/* </Route> */}

                {/* ============ CATCH-ALL ============ */}
                {/* 404 page for undefined routes */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AuthInitializer>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
