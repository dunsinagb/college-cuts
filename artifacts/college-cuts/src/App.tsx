import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout/Layout";
import { AuthProvider, useAuth } from "@/lib/auth-context";
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: 1 },
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
      <Route>{() => (
        <Layout>
          <Switch>
            <Route path="/">{() => <Dashboard />}</Route>
            <Route path="/cuts">{() => <GatedPage path="/cuts" component={CutsList} />}</Route>
            <Route path="/cuts/:id">{() => <CutDetail />}</Route>
            <Route path="/institution/:slug">{() => <InstitutionPage />}</Route>
            <Route path="/analytics">{() => <GatedPage path="/analytics" component={Analytics} />}</Route>
            <Route path="/job-outlook">{() => <GatedPage path="/job-outlook" component={JobOutlook} />}</Route>
            <Route path="/news">{() => <News />}</Route>
            <Route path="/subscribe">{() => <Subscribe />}</Route>
            <Route path="/auth/login">{() => <Login />}</Route>
            <Route path="/auth/signup">{() => <Signup />}</Route>
            <Route path="/auth/callback">{() => <AuthCallback />}</Route>
            <Route path="/submit-tip">{() => <SubmitTip />}</Route>
            <Route path="/about">{() => <About />}</Route>
            <Route path="/intelligence">{() => <IntelligenceLanding />}</Route>
            <Route path="/intelligence/onboarding">{() => <IntelligenceOnboarding />}</Route>
            <Route path="/intelligence/dashboard">{() => <IntelligenceDashboard />}</Route>
            <Route path="/talent">{() => <TalentRegister />}</Route>
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
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
          </AuthProvider>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
