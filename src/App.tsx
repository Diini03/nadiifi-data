import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Suspense, lazy } from "react";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { AuthProvider, useAuth } from "@/lib/auth/AuthProvider";
import { Loader2 } from "lucide-react";

const Home = lazy(() => import("./pages/Home"));
const AuthPage = lazy(() => import("./pages/Auth"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const Resources = lazy(() => import("./pages/Resources"));
const Pricing = lazy(() => import("./pages/Pricing"));
const About = lazy(() => import("./pages/About"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const RouteFallback = () => (
  <div className="grid h-dvh w-full place-items-center text-sm text-muted-foreground">
    <Loader2 className="h-5 w-5 animate-spin" />
  </div>
);

function RequireAuth({ children }: { children: JSX.Element }) {
  const { session, loading } = useAuth();
  const location = useLocation();
  if (loading) return <RouteFallback />;
  if (!session) return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  return children;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <LanguageProvider>
        <TooltipProvider delayDuration={200}>
          <Toaster />
          <Sonner position="top-right" />
          <BrowserRouter>
            <AuthProvider>
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  <Route path="/resources" element={<Resources />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/app" element={<Navigate to="/" replace />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              <ScrollToTopButton />
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
