import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Home from "@/pages/home";
import CalendarPage from "@/pages/calendar";
import EventDetail from "@/pages/event-detail";
import VenuePage from "@/pages/venue";
import VenuesPage from "@/pages/venues";
import FavoritesPage from "@/pages/favorites";
import SubmitPage from "@/pages/submit";
import AdminPage from "@/pages/admin";
import NotFound from "@/pages/not-found";
import { ProgramokPortal } from "@/components/ProgramokPortal";
import { ScenePortal } from "@/components/ScenePortal";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      staleTime: 30 * 1000,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/admin" component={AdminPage} />
      <Route path="/programok" component={ProgramokPortal} />
      <Route path="/plakatfal" component={ScenePortal} />
      <Route path="/" component={ProgramokPortal} />
      <Route>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow pt-16">
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/naptar" component={CalendarPage} />
              <Route path="/esemeny/:id" component={EventDetail} />
              <Route path="/helyszinek" component={VenuesPage} />
              <Route path="/helyszin/:slug" component={VenuePage} />
              <Route path="/erdekel" component={FavoritesPage} />
              <Route path="/bekuldese" component={SubmitPage} />
              <Route component={NotFound} />
            </Switch>
          </main>
          <Footer />
        </div>
      </Route>
    </Switch>
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
