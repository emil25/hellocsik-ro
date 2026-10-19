import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import type { ReactNode } from "react";
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
import OrganizersPage from "@/pages/organizers";
import OrganizerProfilePage from "@/pages/organizer-profile";
import OrganizerHubPage from "@/pages/organizer-hub";
import PricingPage from "@/pages/pricing";
import SzekelyfoldDaysPage from "@/pages/szekelyfold-napok";
import { RegionalLayout } from "@/components/RegionalPortal";
import { RegionalHome, RegionalCitiesPage, RegionalSourcesPage } from "@/components/RegionalDiscovery";
import { RegionalPortalProvider } from "@/lib/portal";
import { RegionalPosterWall } from "@/components/RegionalPosterWall";

function ClassicHomeRoute() {
  return <div className="flex flex-col min-h-screen"><Navbar /><main className="flex-grow pt-16"><Home initialDesign="classic" /></main><Footer /></div>;
}

function CityEventsRoute({ params }: { params: { slug?: string } }) {
  return <Redirect to={`/szekelyfold/varos/${params.slug ?? ""}`} />;
}

function RegionalRouter() {
  return <RegionalPortalProvider><RegionalLayout><Switch>
    <Route path="/" component={RegionalHome} />
    <Route path="/plakatfal" component={RegionalPosterWall} />
    <Route path="/varos/:slug" component={RegionalHome} />
    <Route path="/terseg/:area" component={RegionalHome} />
    <Route path="/varosok" component={RegionalCitiesPage} />
    <Route path="/forrasok" component={RegionalSourcesPage} />
    <Route path="/naptar" component={CalendarPage} />
    <Route path="/esemeny/:id" component={EventDetail} />
    <Route path="/helyszinek" component={VenuesPage} />
    <Route path="/helyszin/:slug" component={VenuePage} />
    <Route path="/erdekel" component={FavoritesPage} />
    <Route path="/bekuldese" component={SubmitPage} />
    <Route path="/szervezok" component={OrganizersPage} />
    <Route path="/szervezo/:slug" component={OrganizerProfilePage} />
    <Route path="/szervezoi-felulet" component={OrganizerHubPage} />
    <Route path="/arak" component={PricingPage} />
    <Route component={NotFound} />
  </Switch></RegionalLayout></RegionalPortalProvider>;
}

function SitePage({ children }: { children: ReactNode }) {
  return <div className="flex flex-col min-h-screen"><Navbar /><main className="flex-grow pt-16">{children}</main><Footer /></div>;
}

function OrganizersRoute() { return <SitePage><OrganizersPage /></SitePage>; }
function OrganizerProfileRoute() { return <SitePage><OrganizerProfilePage /></SitePage>; }
function OrganizerHubRoute() { return <SitePage><OrganizerHubPage /></SitePage>; }
function PricingRoute() { return <SitePage><PricingPage /></SitePage>; }
function SzekelyfoldDaysRoute() { return <SitePage><SzekelyfoldDaysPage /></SitePage>; }
function DefaultHomeRoute() { return <Home />; }

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
      <Route path="/szekelyfold" nest><RegionalRouter /></Route>
      <Route path="/programok" component={ProgramokPortal} />
      <Route path="/plakatfal" component={ScenePortal} />
      <Route path="/szervezok" component={OrganizersRoute} />
      <Route path="/szervezo/:slug" component={OrganizerProfileRoute} />
      <Route path="/szervezoi-felulet" component={OrganizerHubRoute} />
      <Route path="/arak" component={PricingRoute} />
      <Route path="/szekelyfold-napok" component={SzekelyfoldDaysRoute} />
      <Route path="/klasszikus" component={ClassicHomeRoute} />
      <Route path="/varos/:slug" component={CityEventsRoute} />
      <Route path="/" component={ClassicHomeRoute} />
      <Route>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow pt-16">
            <Switch>
              <Route path="/" component={DefaultHomeRoute} />
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
