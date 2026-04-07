import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useDevTools } from "@/hooks/useDevTools";
import { lazy, Suspense } from "react";

// Layouts
import { MainLayout, AuthLayout } from "@/components/layout";

// Route Guards
import { PublicRoute, OTPVerifyRoute, AuthInitializer, ProtectedRoute } from "@/routes";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Load landing page eagerly (important for homepage)
import LandingPage from "./pages/LandingPage";

// Lazy load other pages for better initial load
const Index = lazy(() => import("./pages/Index"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const OTPLogin = lazy(() => import("./pages/OTPLogin").then(m => ({
  default: m.OTPLogin
})));
const VerifyOtp = lazy(() => import("@/pages/VerifyOtp"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ChatPage = lazy(() => import("./pages/ChatPage"));
const ProjectSettings = lazy(() => import("./pages/ProjectSettings"));
const Profile = lazy(() => import("./pages/Profile"));
const SecurityPage = lazy(() => import("./pages/Settings/SecurityPage"));
const PreferencesPage = lazy(() => import("./pages/Settings/PreferencesPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading fallback component
const LoadingFallback = () => <div className="min-h-screen flex items-center justify-center dark bg-background">
    <div className="animate-spin">⏳ Loading...</div>
  </div>;
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      // 5 minutes
      gcTime: 1000 * 60 * 10 // 10 minutes (was cacheTime)
    }
  }
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
  return <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />

          <AuthInitializer>
            <BrowserRouter>
              <Suspense fallback={<LoadingFallback />}>
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
                  {/* All routes here require authentication */}
                  {/* ProtectedRoute checks isAuthenticated and redirects to /login if needed */}
                  <Route element={<ProtectedRoute />}>
                    <Route element={<MainLayout />}>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/projects/:projectId/chat" element={<ChatPage />} />
                      <Route path="/projects/:projectId/settings" element={<ProjectSettings />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/settings/security" element={<SecurityPage />} />
                      <Route path="/settings/preferences" element={<PreferencesPage />} />
                    </Route>
                  </Route>

                  {/* Password Reset Route - Uses AuthLayout instead of MainLayout */}
                  <Route element={<AuthLayout />}>
                    <Route path="/reset-password" element={<ResetPassword />} />
                  </Route>

                  {/* ============ CATCH-ALL ============ */}
                  {/* 404 page for undefined routes */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </AuthInitializer>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>;
}
export default App;
