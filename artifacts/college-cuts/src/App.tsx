import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout/Layout";
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function isSubscribed() {
  return localStorage.getItem("cc_subscribed") === "1";
}

function GatedPage({ path, component: Component }: { path: string; component: React.ComponentType }) {
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isSubscribed()) {
      navigate(`/subscribe?redirect=${encodeURIComponent(path)}`, { replace: true });
    }
  }, [path, navigate]);

  if (!isSubscribed()) return null;
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/embed/:slug">{() => (
        <div className="p-3">
          <EmbedWidget />
        </div>
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
            <Route path="/submit-tip">{() => <SubmitTip />}</Route>
            <Route path="/about">{() => <About />}</Route>
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
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
