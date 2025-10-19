import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Wallet, GitBranch, Shield, TrendingUp, Clock, DollarSign, Calendar, User, Building2, CheckCircle2, ExternalLink, X, Bitcoin, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import NavigationBar from "@/components/NavigationBar";
import { fetchCryptoPrices, formatCurrency } from "@/services/publicApis";

interface Invoice {
  id: string;
  status: string;
  amount: string;
  dao: string;
  progress: number;
  contractor: string;
  dueDate: string;
  description?: string;
  milestones?: { title: string; completed: boolean }[];
  createdDate?: string;
  escrowAddress?: string;
}

const Dashboard = () => {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [btcPrice, setBtcPrice] = useState<number | null>(null);
  const [stxPrice, setStxPrice] = useState<number | null>(null);
  const [pricesLoading, setPricesLoading] = useState(true);

  // Fetch live crypto prices on mount and refresh every 2 minutes
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const prices = await fetchCryptoPrices(['bitcoin', 'blockstack'], ['usd']);
        setBtcPrice(prices.bitcoin.usd);
        setStxPrice(prices.blockstack.usd);
      } catch (error) {
        console.error('Failed to fetch crypto prices:', error);
      } finally {
        setPricesLoading(false);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 120000); // Refresh every 2 minutes
    return () => clearInterval(interval);
  }, []);

  const handleInvoiceClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDialogOpen(true);
  };

  const invoices: Invoice[] = [
    { 
      id: "INV-001", 
      status: "funded", 
      amount: "$12,500", 
      dao: "DeFi DAO",
      progress: 75,
      contractor: "Alice Johnson",
      dueDate: "Dec 31, 2024",
      createdDate: "Nov 15, 2024",
      description: "Smart contract development and security audit for DeFi lending protocol",
      escrowAddress: "SP2X...7K9Q",
      milestones: [
        { title: "Initial contract development", completed: true },
        { title: "Security audit completion", completed: true },
        { title: "Final deployment and documentation", completed: false }
      ]
    },
    { 
      id: "INV-002", 
      status: "pending", 
      amount: "$8,300", 
      dao: "NFT Collective",
      progress: 0,
      contractor: "Bob Smith",
      dueDate: "Jan 15, 2025",
      createdDate: "Dec 10, 2024",
      description: "UI/UX design and frontend development for NFT marketplace",
      escrowAddress: "SP3Y...2M8R",
      milestones: [
        { title: "Design mockups", completed: false },
        { title: "Frontend implementation", completed: false },
        { title: "Testing and deployment", completed: false }
      ]
    },
    { 
      id: "INV-003", 
      status: "completed", 
      amount: "$15,000", 
      dao: "Web3 Guild",
      progress: 100,
      contractor: "Carol White",
      dueDate: "Dec 20, 2024",
      createdDate: "Nov 1, 2024",
      description: "Full-stack development of educational platform with blockchain integration",
      escrowAddress: "SP1Z...5N3P",
      milestones: [
        { title: "Backend API development", completed: true },
        { title: "Frontend implementation", completed: true },
        { title: "Blockchain integration", completed: true }
      ]
    },
    { 
      id: "INV-004", 
      status: "funded", 
      amount: "$9,200", 
      dao: "DAO Builders",
      progress: 40,
      contractor: "David Lee",
      dueDate: "Jan 10, 2025",
      createdDate: "Dec 1, 2024",
      description: "Token economics modeling and governance framework implementation",
      escrowAddress: "SP4A...8W6T",
      milestones: [
        { title: "Economics model design", completed: true },
        { title: "Governance implementation", completed: false },
        { title: "Documentation and testing", completed: false }
      ]
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "funded":
        return "bg-blue-500";
      case "pending":
        return "bg-yellow-500";
      default:
        return "bg-gray-300";
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <NavigationBar />
      <div className="container mx-auto px-4 py-8">
        <header className="mb-12">
          <h1 className="text-4xl font-bold mb-2 text-gray-900">
            Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Monitor your DAO's invoice activities and treasury metrics
          </p>
        </header>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <FileText className="w-8 h-8 text-blue-600" />
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <CardTitle className="text-lg">Active Invoices</CardTitle>
              <CardDescription>Current ongoing deals</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-gray-900">12</p>
              <p className="text-sm text-green-600 mt-1">+3 this month</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Wallet className="w-8 h-8 text-purple-600" />
                <DollarSign className="w-5 h-5 text-purple-500" />
              </div>
              <CardTitle className="text-lg">Total Value</CardTitle>
              <CardDescription>Locked in escrow</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-gray-900">$45.2K</p>
              <p className="text-sm text-gray-600 mt-1">Across 12 deals</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <GitBranch className="w-8 h-8 text-green-600" />
                <Clock className="w-5 h-5 text-green-500" />
              </div>
              <CardTitle className="text-lg">Milestones</CardTitle>
              <CardDescription>Completed this month</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-gray-900">24</p>
              <p className="text-sm text-green-600 mt-1">96% on time</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Shield className="w-8 h-8 text-orange-600" />
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-semibold">
                  ACTIVE
                </span>
              </div>
              <CardTitle className="text-lg">Disputes</CardTitle>
              <CardDescription>Currently active</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-gray-900">2</p>
              <p className="text-sm text-gray-600 mt-1">1 pending review</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <Card className="shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">Recent Invoices</CardTitle>
                    <CardDescription>Your latest invoice activities</CardDescription>
                  </div>
                  <Link to="/invoices">
                    <Button variant="outline" size="sm">View All</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      onClick={() => handleInvoiceClick(invoice)}
                      className="flex items-center justify-between p-5 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <FileText className="w-8 h-8 text-gray-500 group-hover:text-blue-600 transition-colors" />
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <p className="font-bold text-lg group-hover:text-blue-600 transition-colors">{invoice.id}</p>
                            <Badge
                              variant={
                                invoice.status === "completed"
                                  ? "default"
                                  : invoice.status === "funded"
                                  ? "secondary"
                                  : "outline"
                              }
                              className={
                                invoice.status === "completed"
                                  ? "bg-green-600"
                                  : invoice.status === "funded"
                                  ? "bg-blue-600"
                                  : ""
                              }
                            >
                              {invoice.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{invoice.dao} • {invoice.contractor}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
                              <div 
                                className={`h-2 rounded-full ${getStatusColor(invoice.status)}`}
                                style={{ width: `${invoice.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500">{invoice.progress}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-xl text-gray-900">{invoice.amount}</p>
                          <p className="text-xs text-gray-500">Due: {invoice.dueDate}</p>
                        </div>
                        <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-xl">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/create">
                  <Button className="w-full justify-start" size="lg">
                    <FileText className="mr-2 w-5 h-5" />
                    Create New Invoice
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  size="lg"
                  onClick={() => alert('Fund Escrow\n\nThis will:\n1. Select an invoice to fund\n2. Connect your wallet\n3. Transfer funds to escrow contract\n\nClick "View All" to see invoices or navigate to Invoice Manager.')}
                >
                  <Wallet className="mr-2 w-5 h-5" />
                  Fund Escrow
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  size="lg"
                  onClick={() => alert('Review Milestone\n\nView pending milestones that need review:\n1. Check deliverables\n2. Approve or request changes\n3. Trigger payment release\n\nNavigate to Invoice Manager to review specific invoices.')}
                >
                  <GitBranch className="mr-2 w-5 h-5" />
                  Review Milestone
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  size="lg"
                  onClick={() => alert('View Disputes\n\nCurrently: 2 active disputes\n\nManage dispute resolution:\n1. Review evidence\n2. Vote on resolution\n3. Execute smart contract decision\n\n(Mock data - navigate to specific invoices to see disputes)')}
                >
                  <Shield className="mr-2 w-5 h-5" />
                  View Disputes
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-md bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="text-xl">Treasury Health</CardTitle>
                <CardDescription>Overall DAO metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Success Rate</span>
                  <span className="text-lg font-bold text-green-600">98.5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Avg. Completion</span>
                  <span className="text-lg font-bold text-blue-600">12 days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Paid</span>
                  <span className="text-lg font-bold text-purple-600">$342K</span>
                </div>
              </CardContent>
            </Card>

            {/* Live Crypto Prices */}
            <Card className="shadow-md bg-gradient-to-br from-orange-50 to-amber-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Bitcoin className="w-5 h-5 text-orange-600" />
                    Live Prices
                  </CardTitle>
                  {pricesLoading && <Loader2 className="w-4 h-4 animate-spin text-orange-600" />}
                </div>
                <CardDescription>Real-time cryptocurrency rates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {btcPrice && (
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <Bitcoin className="w-4 h-4 text-orange-600" />
                      Bitcoin (BTC)
                    </span>
                    <span className="text-lg font-bold text-orange-600">{formatCurrency(btcPrice)}</span>
                  </div>
                )}
                {stxPrice && (
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                      Stacks (STX)
                    </span>
                    <span className="text-lg font-bold text-purple-600">{formatCurrency(stxPrice)}</span>
                  </div>
                )}
                <p className="text-xs text-gray-500 text-center pt-2">
                  Updates every 2 minutes
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Invoice Detail Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedInvoice && (
              <>
                <DialogHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-blue-600" />
                      <div>
                        <DialogTitle className="text-2xl">{selectedInvoice.id}</DialogTitle>
                        <DialogDescription className="text-base mt-1">
                          Invoice Details and Progress
                        </DialogDescription>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`${
                        selectedInvoice.status === "completed"
                          ? "bg-green-100 text-green-800 border-green-300"
                          : selectedInvoice.status === "funded"
                          ? "bg-blue-100 text-blue-800 border-blue-300"
                          : "bg-yellow-100 text-yellow-800 border-yellow-300"
                      } text-sm px-3 py-1`}
                    >
                      {selectedInvoice.status.toUpperCase()}
                    </Badge>
                  </div>
                </DialogHeader>

                <div className="space-y-6 mt-6">
                  {/* Amount and Progress */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                          <p className="text-3xl font-bold text-gray-900">{selectedInvoice.amount}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Progress</p>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-gray-200 rounded-full h-3">
                              <div 
                                className={`h-3 rounded-full ${getStatusColor(selectedInvoice.status)}`}
                                style={{ width: `${selectedInvoice.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-xl font-bold text-gray-900">{selectedInvoice.progress}%</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Description */}
                  {selectedInvoice.description && (
                    <Card>
                      <CardContent className="pt-6">
                        <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-gray-600" />
                          Description
                        </h3>
                        <p className="text-gray-700">{selectedInvoice.description}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Key Information */}
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold text-lg mb-4">Key Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                          <Building2 className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="text-xs text-gray-600">DAO</p>
                            <p className="font-semibold">{selectedInvoice.dao}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <User className="w-5 h-5 text-purple-600" />
                          <div>
                            <p className="text-xs text-gray-600">Contractor</p>
                            <p className="font-semibold">{selectedInvoice.contractor}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-orange-600" />
                          <div>
                            <p className="text-xs text-gray-600">Created Date</p>
                            <p className="font-semibold">{selectedInvoice.createdDate}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-red-600" />
                          <div>
                            <p className="text-xs text-gray-600">Due Date</p>
                            <p className="font-semibold">{selectedInvoice.dueDate}</p>
                          </div>
                        </div>
                        {selectedInvoice.escrowAddress && (
                          <div className="flex items-center gap-3 col-span-2">
                            <Wallet className="w-5 h-5 text-green-600" />
                            <div>
                              <p className="text-xs text-gray-600">Escrow Address</p>
                              <p className="font-semibold font-mono">{selectedInvoice.escrowAddress}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Milestones */}
                  {selectedInvoice.milestones && selectedInvoice.milestones.length > 0 && (
                    <Card>
                      <CardContent className="pt-6">
                        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                          <GitBranch className="w-5 h-5 text-gray-600" />
                          Milestones
                        </h3>
                        <div className="space-y-3">
                          {selectedInvoice.milestones.map((milestone, index) => (
                            <div 
                              key={index}
                              className={`flex items-center gap-3 p-3 rounded-lg border-2 ${
                                milestone.completed 
                                  ? 'bg-green-50 border-green-200' 
                                  : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <CheckCircle2 
                                className={`w-5 h-5 flex-shrink-0 ${
                                  milestone.completed ? 'text-green-600' : 'text-gray-400'
                                }`}
                              />
                              <div className="flex-1">
                                <p className={`font-medium ${
                                  milestone.completed ? 'text-gray-900' : 'text-gray-600'
                                }`}>
                                  {milestone.title}
                                </p>
                              </div>
                              {milestone.completed && (
                                <Badge className="bg-green-600">Completed</Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Link to={`/invoice/${selectedInvoice.id}`} className="flex-1">
                      <Button className="w-full" size="lg">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Full Details
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Dashboard;

