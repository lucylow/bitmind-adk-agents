import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import CreateInvoice from "./pages/CreateInvoice";
import InvoiceDetails from "./pages/InvoiceDetails";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import InvoiceManager from "./pages/InvoiceManager";
import Help from "./pages/Help";
import Demo from "./pages/Demo";
import SupabaseTest from "./pages/SupabaseTest";
// Advanced DeFi Feature Pages
import NFTMarketplace from "./pages/NFTMarketplace";
import Analytics from "./pages/Analytics";
import YieldOptimizerPage from "./pages/YieldOptimizerPage";
import CrossChainSwapPage from "./pages/CrossChainSwapPage";
import Treasury from "./pages/Treasury";
import InvoiceEditorPage from "./pages/InvoiceEditorPage";
import APIShowcase from "./pages/APIShowcase";
import RealtimeMonitor from "./pages/RealtimeMonitor";
import DiscordNotifications from "./pages/DiscordNotifications";
import InteractiveDemo from "./pages/InteractiveDemo";
import GovernanceCopilot from "./pages/GovernanceCopilot";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Landing Page - First page users see */}
          <Route path="/landing" element={<LandingPage />} />
          
          {/* Main Landing - Public with Demo Mode */}
          <Route path="/" element={<Index />} />
          
          {/* Demo Pages - Public for easy access without wallet */}
          <Route path="/demo" element={<Demo />} />
          <Route path="/interactive-demo" element={<InteractiveDemo />} />
          <Route path="/governance" element={<GovernanceCopilot />} />
          
          {/* All Features - Open Access (wallet required only for transactions) */}
          <Route path="/app" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/invoices" element={<InvoiceManager />} />
          <Route path="/create" element={<CreateInvoice />} />
          <Route path="/invoice/:id" element={<InvoiceDetails />} />
          
          {/* Public Info Routes */}
          <Route path="/help" element={<Help />} />
          
          {/* API Showcase - Public for demonstration */}
          <Route path="/api-showcase" element={<APIShowcase />} />
          <Route path="/supabase-test" element={<SupabaseTest />} />
          <Route path="/realtime-monitor" element={<RealtimeMonitor />} />
          
          {/* Advanced Features - Open Access */}
          <Route path="/nft-marketplace" element={<NFTMarketplace />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/yield-optimizer" element={<YieldOptimizerPage />} />
          <Route path="/cross-chain-swap" element={<CrossChainSwapPage />} />
          <Route path="/treasury" element={<Treasury />} />
          <Route path="/invoice-editor" element={<InvoiceEditorPage />} />
          <Route path="/discord-notifications" element={<DiscordNotifications />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
