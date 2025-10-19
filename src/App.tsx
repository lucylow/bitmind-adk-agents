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
          
          {/* Protected Dashboard and Features */}
          <Route path="/app" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/invoices" element={<ProtectedRoute><InvoiceManager /></ProtectedRoute>} />
          <Route path="/create" element={<ProtectedRoute><CreateInvoice /></ProtectedRoute>} />
          <Route path="/invoice/:id" element={<ProtectedRoute><InvoiceDetails /></ProtectedRoute>} />
          
          {/* Public Info Routes */}
          <Route path="/help" element={<Help />} />
          
          {/* API Showcase - Public for demonstration */}
          <Route path="/api-showcase" element={<APIShowcase />} />
          <Route path="/supabase-test" element={<SupabaseTest />} />
          <Route path="/realtime-monitor" element={<RealtimeMonitor />} />
          
          {/* Advanced DeFi Feature Routes - Protected */}
          <Route path="/nft-marketplace" element={<ProtectedRoute><NFTMarketplace /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/yield-optimizer" element={<ProtectedRoute><YieldOptimizerPage /></ProtectedRoute>} />
          <Route path="/cross-chain-swap" element={<ProtectedRoute><CrossChainSwapPage /></ProtectedRoute>} />
          <Route path="/treasury" element={<ProtectedRoute><Treasury /></ProtectedRoute>} />
          <Route path="/invoice-editor" element={<ProtectedRoute><InvoiceEditorPage /></ProtectedRoute>} />
          <Route path="/discord-notifications" element={<ProtectedRoute><DiscordNotifications /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
