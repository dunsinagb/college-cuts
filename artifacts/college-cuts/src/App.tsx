import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout/Layout";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import CutsList from "@/pages/cuts-list";
import CutDetail from "@/pages/cut-detail";
import Analytics from "@/pages/analytics";
import SubmitTip from "@/pages/submit-tip";
import About from "@/pages/about";
import Subscribe from "@/pages/subscribe";
import JobOutlook from "@/pages/job-outlook";
import News from "@/pages/news";
import InstitutionPage from "@/pages/institution";
import EmbedWidget from "@/pages/embed";
import IntelligenceLanding from "@/pages/intelligence/index";
import IntelligenceOnboarding from "@/pages/intelligence/onboarding";
import IntelligenceDashboard from "@/pages/intelligence/dashboard";
import TalentRegister from "@/pages/talent/index";
import Login from "@/pages/auth/login";
import Signup from "@/pages/auth/signup";
import AuthCallback from "@/pages/auth/callback";
import Profile from "@/pages/profile";
import ChartsPage from "@/pages/charts";

function resolveStatus(error: unknown): number {
  if (error && typeof error === "object") {
    if ("status" in error && typeof (error as { status: number }).status === "number") {
      return (error as { status: number }).status;
    }
    if ("message" in error) {
      const parsed = parseInt((error as Error).message ?? "");
      if (!isNaN(parsed)) return parsed;
    }
  }
  return 0;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        const status = resolveStatus(error);
        if (status === 429) return failureCount < 3;
        if (status >= 400 && status < 500) return false;
        return failureCount < 1;
      },
      retryDelay: (attemptIndex, error) => {
        const status = resolveStatus(error);
        if (status === 429) return Math.min(1000 * 2 ** attemptIndex, 8000);
        return 1000;
      },
    },
  },
});

function GatedPage({ path, component: Component }: { path: string; component: React.ComponentType }) {
  const [, navigate] = useLocation();
  const { user, role, loading } = useAuth();

  const legacyAccess = localStorage.getItem("cc_subscribed") === "1";

  useEffect(() => {
    if (loading) return;
    const hasAccess = legacyAccess || user !== null;
    if (!hasAccess) {
      navigate(`/auth/login?redirect=${encodeURIComponent(path)}`, { replace: true });
    }
  }, [loading, user, path, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 rounded-full border-2 border-[#1e3a5f] border-t-transparent animate-spin" />
      </div>
    );
  }

  const hasAccess = legacyAccess || user !== null;
  if (!hasAccess) return null;
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/embed/:slug">{() => (
        <div className="p-3"><EmbedWidget /></div>
      )}</Route>
      <Route path="/charts/solo">{() => <ChartsPage />}</Route>
      <Route>{() => (
        <Layout>
          <Switch>
            <Route path="/">{() => <Dashboard />}</Route>
            <Route path="/cuts">{() => <GatedPage path="/cuts" component={CutsList} />}</Route>
            <Route path="/cuts/:id">{() => <CutDetail />}</Route>
            <Route path="/institution/:slug">{() => <InstitutionPage />}</Route>
            <Route path="/analytics">{() => <GatedPage path="/analytics" component={Analytics} />}</Route>
            <Route path="/job-outlook">{() => <JobOutlook />}</Route>
            <Route path="/news">{() => <News />}</Route>
            <Route path="/subscribe">{() => <Subscribe />}</Route>
            <Route path="/auth/login">{() => <Login />}</Route>
            <Route path="/auth/signup">{() => <Signup />}</Route>
            <Route path="/auth/callback">{() => <AuthCallback />}</Route>
            <Route path="/profile">{() => <Profile />}</Route>
            <Route path="/submit-tip">{() => <SubmitTip />}</Route>
            <Route path="/about">{() => <About />}</Route>
            <Route path="/intelligence">{() => <IntelligenceLanding />}</Route>
            <Route path="/intelligence/onboarding">{() => <IntelligenceOnboarding />}</Route>
            <Route path="/intelligence/dashboard">{() => <IntelligenceDashboard />}</Route>
            <Route path="/talent">{() => <TalentRegister />}</Route>
            <Route path="/charts">{() => <ChartsPage />}</Route>
            <Route>{() => <NotFound />}</Route>
          </Switch>
        </Layout>
      )}</Route>
    </Switch>
  );
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <ErrorBoundary>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <Router />
              </WouterRouter>
            </ErrorBoundary>
          </AuthProvider>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
