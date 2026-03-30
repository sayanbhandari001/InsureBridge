import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";

// Pages
import Dashboard from "@/pages/dashboard";
import Claims from "@/pages/claims";
import Chat from "@/pages/chat";
import CallLogs from "@/pages/calls";
import Documents from "@/pages/documents";
import Bills from "@/pages/bills";
import Feedback from "@/pages/feedback";
import Users from "@/pages/users";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/claims" component={Claims} />
        {/* Detail view would be routed here e.g. /claims/:id -> reuse Claims or dedicated page, for now list covers it */}
        <Route path="/chat" component={Chat} />
        <Route path="/calls" component={CallLogs} />
        <Route path="/documents" component={Documents} />
        <Route path="/bills" component={Bills} />
        <Route path="/feedback" component={Feedback} />
        <Route path="/users" component={Users} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
