import { useEffect } from "react"
import { Switch, Route, Router as WouterRouter, Redirect } from "wouter"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AuthProvider, useAuth } from "@/lib/auth"
import { Layout } from "@/components/layout"

// Pages
import Login from "@/pages/login"
import Dashboard from "@/pages/dashboard"
import Claims from "@/pages/claims"
import Chat from "@/pages/chat"
import CallLogs from "@/pages/calls"
import Documents from "@/pages/documents"
import Bills from "@/pages/bills"
import Feedback from "@/pages/feedback"
import Users from "@/pages/users"
import Ecards from "@/pages/ecards"
import NetworkProviders from "@/pages/network"
import Scrutiny from "@/pages/scrutiny"
import Portability from "@/pages/portability"
import Renewals from "@/pages/renewals"
import Members from "@/pages/members"
import Settlements from "@/pages/settlements"
import Retention from "@/pages/retention"
import NotFound from "@/pages/not-found"

const HUB_URL = "https://replit.com/@sayanbhandari00/Insurance-Bridge-Hub"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
})

function HubRedirect() {
  useEffect(() => {
    const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? ""
    const loginUrl = encodeURIComponent(window.location.origin + base + "/login")
    window.location.href = `${HUB_URL}?returnUrl=${loginUrl}`
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
      <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
        <span className="text-primary-foreground text-2xl font-bold leading-none">I</span>
      </div>
      <div className="text-center">
        <p className="text-foreground font-semibold text-lg">InsuraBridge</p>
        <p className="text-muted-foreground text-sm mt-1">Redirecting to InsuraBridge Hub…</p>
      </div>
      <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
    </div>
  )
}

function ProtectedRouter() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route component={HubRedirect} />
      </Switch>
    )
  }

  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/claims" component={Claims} />
        <Route path="/chat" component={Chat} />
        <Route path="/calls" component={CallLogs} />
        <Route path="/documents" component={Documents} />
        <Route path="/bills" component={Bills} />
        <Route path="/feedback" component={Feedback} />
        <Route path="/users" component={Users} />
        <Route path="/ecards" component={Ecards} />
        <Route path="/network" component={NetworkProviders} />
        <Route path="/scrutiny" component={Scrutiny} />
        <Route path="/portability" component={Portability} />
        <Route path="/renewals" component={Renewals} />
        <Route path="/members" component={Members} />
        <Route path="/settlements" component={Settlements} />
        <Route path="/retention" component={Retention} />
        <Route path="/login">
          <Redirect to="/" />
        </Route>
        <Route component={NotFound} />
      </Switch>
    </Layout>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <ProtectedRouter />
          </WouterRouter>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App
