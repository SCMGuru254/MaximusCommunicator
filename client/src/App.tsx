import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Settings from "@/pages/settings";
import Contacts from "@/pages/contacts";
import MenuBuilder from "@/pages/menu-builder";
import Security from "@/pages/security";
import Analytics from "@/pages/analytics";
import Help from "@/pages/help";
import NousChat from "@/pages/NousChat";
import NousSettings from "@/pages/NousSettings";
import MainNavigation from "@/components/layout/MainNavigation";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/settings" component={Settings} />
      <Route path="/contacts" component={Contacts} />
      <Route path="/menu-builder" component={MenuBuilder} />
      <Route path="/security" component={Security} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/help" component={Help} />
      <Route path="/nous-chat" component={NousChat} />
      <Route path="/nous-settings" component={NousSettings} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <div className="flex">
          <MainNavigation />
          <main className="flex-1">
            <Router />
          </main>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
