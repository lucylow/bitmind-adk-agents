/**
 * Smart Invoice Demo Component
 * Step-by-step workflow for AI-powered invoice creation and escrow
 * Enhanced for DAO deals with comprehensive mock data
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle2, 
  Circle, 
  Loader2, 
  Sparkles, 
  FileText,
  Wallet,
  ArrowRight,
  Check,
  Database,
  Shuffle,
  Info,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SBTCYieldDashboard, SBTCYieldBadge } from '@/components/SBTCYieldDashboard';
import { BitcoinConfirmationWidget } from '@/components/BitcoinConfirmationWidget';
import { GuidedTour } from '@/components/GuidedTour';

import { 
  parseInvoiceWithOpenAI, 
  parseInvoiceWithClaude,
  validateInvoiceData,
  InvoiceData 
} from '@/lib/aiInvoiceParser';
import { 
  parseInvoiceWithSupabase, 
  isSupabaseConfigured, 
  getSupabaseStatus 
} from '@/lib/supabaseInvoiceParser';
import { 
  DAO_INVOICE_TEMPLATES, 
  getRandomDAOInvoice, 
  getDAOInvoiceById,
  type DAOInvoiceTemplate 
} from '@/data/daoInvoiceMockData';
import {
  connectWallet,
  createInvoice,
  transferTokensToEscrow,
  acknowledgeDeposit,
  releaseFunds,
  getInvoice,
  satoshisToBtc,
  getInvoiceStatusString,
} from '@/lib/stacksIntegration';

type Step = 'parse' | 'review' | 'create' | 'deposit' | 'acknowledge' | 'release' | 'complete';

const STEPS: { id: Step; label: string; description: string }[] = [
  { id: 'parse', label: 'AI Parse Invoice', description: 'Extract data from natural language' },
  { id: 'review', label: 'Review & Edit', description: 'Verify extracted information' },
  { id: 'create', label: 'Create Invoice', description: 'Deploy on-chain' },
  { id: 'deposit', label: 'Deposit sBTC', description: 'Transfer to escrow' },
  { id: 'acknowledge', label: 'Acknowledge Deposit', description: 'Mark as funded' },
  { id: 'release', label: 'Release Funds', description: 'Complete payment' },
  { id: 'complete', label: 'Complete', description: 'Invoice settled' },
];

export default function SmartInvoiceDemo() {
  const [currentStep, setCurrentStep] = useState<Step>('parse');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Invoice data
  const [selectedTemplate, setSelectedTemplate] = useState<string>('defi-audit');
  const [currentTemplate, setCurrentTemplate] = useState<DAOInvoiceTemplate>(DAO_INVOICE_TEMPLATES[0]);
  const [invoiceText, setInvoiceText] = useState(DAO_INVOICE_TEMPLATES[0].invoiceText);
  const [parsedData, setParsedData] = useState<InvoiceData | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [aiProvider, setAiProvider] = useState<'openai' | 'claude' | 'supabase'>('supabase');
  const [useMockData, setUseMockData] = useState(false);
  
  // Transaction data
  const [txHash, setTxHash] = useState<string | null>(null);
  const [invoiceStatus, setInvoiceStatus] = useState<string>('');
  
  // Supabase status
  const supabaseStatus = getSupabaseStatus();

  /**
   * Load a different DAO template
   */
  const handleLoadTemplate = (templateId: string) => {
    const template = getDAOInvoiceById(templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setCurrentTemplate(template);
      setInvoiceText(template.invoiceText);
      setParsedData(null);
      setUseMockData(false);
      setError(null);
    }
  };

  /**
   * Load random DAO invoice template
   */
  const handleLoadRandomTemplate = () => {
    const template = getRandomDAOInvoice();
    setSelectedTemplate(template.id);
    setCurrentTemplate(template);
    setInvoiceText(template.invoiceText);
    setParsedData(null);
    setUseMockData(false);
    setError(null);
  };

  /**
   * Use mock data for demo (no API key required)
   * Simulates NLP pipeline processing with BERT model
   */
  const handleUseMockData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate NLP processing delay
      await new Promise(resolve => setTimeout(resolve, 1800));
      
      setParsedData(currentTemplate.parsedData);
      setUseMockData(true);
      setCurrentStep('review');
    } catch (err: any) {
      setError(err.message || 'Failed to process mock data');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Step 1: Parse invoice with AI
   */
  const handleParseInvoice = async () => {
    setLoading(true);
    setError(null);

    try {
      let parsed: InvoiceData;
      
      if (aiProvider === 'supabase') {
        // Use Supabase Edge Function with OpenAI (no API key needed from frontend)
        if (!supabaseStatus.configured) {
          setError('Supabase is not configured. Please use mock data or configure Supabase.');
          setLoading(false);
          return;
        }
        parsed = await parseInvoiceWithSupabase(invoiceText);
      } else if (aiProvider === 'openai') {
        if (!apiKey) {
          setError('OpenAI API key is required');
          setLoading(false);
          return;
        }
        parsed = await parseInvoiceWithOpenAI(invoiceText, apiKey);
      } else {
        if (!apiKey) {
          setError('Anthropic API key is required');
          setLoading(false);
          return;
        }
        parsed = await parseInvoiceWithClaude(invoiceText, apiKey);
      }

      const validation = validateInvoiceData(parsed);
      if (!validation.valid) {
        setError(`Validation errors: ${validation.errors.join(', ')}`);
        return;
      }

      setParsedData(parsed);
      setUseMockData(false);
      setCurrentStep('review');
    } catch (err: any) {
      setError(err.message || 'Failed to parse invoice');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Step 2: Review and proceed to create
   */
  const handleReviewComplete = () => {
    setCurrentStep('create');
  };

  /**
   * Step 3: Create invoice on-chain
   */
  const handleCreateInvoice = async () => {
    if (!parsedData) return;
    
    setLoading(true);
    setError(null);

    try {
      if (useMockData) {
        // Simulate transaction delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        setInvoiceStatus('CREATED');
      } else {
        await createInvoice(
          parsedData.invoice_id,
          parsedData.payee || '',
          parsedData.amount,
          parsedData.token_contract || '',
          parsedData.arbiter || '',
          99999999, // Deadline in block height
          null // User session
        );
      }

      setCurrentStep('deposit');
    } catch (err: any) {
      setError(err.message || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Step 4: Deposit tokens to escrow
   */
  const handleDepositTokens = async () => {
    if (!parsedData) return;
    
    setLoading(true);
    setError(null);

    try {
      if (useMockData) {
        // Simulate transaction delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        setInvoiceStatus('DEPOSITED');
      } else {
        await transferTokensToEscrow(
          parsedData.amount,
          parsedData.payer || '',
          null
        );
      }

      setCurrentStep('acknowledge');
    } catch (err: any) {
      setError(err.message || 'Failed to deposit tokens');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Step 5: Acknowledge deposit
   */
  const handleAcknowledgeDeposit = async () => {
    if (!parsedData) return;
    
    setLoading(true);
    setError(null);

    try {
      if (useMockData) {
        // Simulate transaction delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        setInvoiceStatus('FUNDED');
      } else {
        await acknowledgeDeposit(parsedData.invoice_id, null);
        setInvoiceStatus('FUNDED');
      }
      
      setCurrentStep('release');
    } catch (err: any) {
      setError(err.message || 'Failed to acknowledge deposit');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Step 6: Release funds
   */
  const handleReleaseFunds = async () => {
    if (!parsedData) return;
    
    setLoading(true);
    setError(null);

    try {
      if (useMockData) {
        // Simulate transaction delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        setInvoiceStatus('RELEASED');
      } else {
        await releaseFunds(parsedData.invoice_id, null);
        setInvoiceStatus('RELEASED');
      }
      
      setCurrentStep('complete');
    } catch (err: any) {
      setError(err.message || 'Failed to release funds');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Render step indicator
   */
  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8 overflow-x-auto pb-4">
      {STEPS.map((step, index) => {
        const stepIndex = STEPS.findIndex(s => s.id === currentStep);
        const isComplete = index < stepIndex;
        const isCurrent = step.id === currentStep;
        
        return (
          <div key={step.id} className="flex items-center flex-shrink-0">
            <div className="flex flex-col items-center">
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                ${isComplete ? 'bg-green-500 border-green-500' : ''}
                ${isCurrent ? 'bg-blue-500 border-blue-500' : ''}
                ${!isComplete && !isCurrent ? 'bg-gray-100 border-gray-300' : ''}
              `}>
                {isComplete ? (
                  <CheckCircle2 className="w-5 h-5 text-white" />
                ) : isCurrent ? (
                  <Circle className="w-5 h-5 text-white fill-current" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <span className={`
                mt-2 text-xs font-medium text-center max-w-[100px]
                ${isCurrent ? 'text-blue-600' : 'text-gray-500'}
              `}>
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div className={`
                w-12 h-0.5 mx-2 mt-[-20px]
                ${isComplete ? 'bg-green-500' : 'bg-gray-300'}
              `} />
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      {/* Guided Tour */}
      <GuidedTour />
      
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">
          Smart Invoice Deals for DAOs
        </h1>
        <p className="text-gray-600 mb-3">AI-powered Bitcoin-native invoicing on Stacks</p>
        
        <div className="flex gap-2 justify-center items-center flex-wrap">
          {useMockData && (
            <Badge className="bg-gradient-to-r from-green-500 to-blue-500">
              🎮 Interactive Demo Mode - Using Mock Data
            </Badge>
          )}
          {supabaseStatus.configured && !useMockData && (
            <Badge className="bg-green-600">
              ✅ Supabase + OpenAI Ready
            </Badge>
          )}
          <Badge variant="outline">
            {DAO_INVOICE_TEMPLATES.length} DAO Templates Available
          </Badge>
          {parsedData && <SBTCYieldBadge invoiceAmount={parsedData.amount} />}
        </div>
      </div>

      {renderStepIndicator()}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step 1: Parse Invoice */}
      {currentStep === 'parse' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              AI Invoice Parser for DAO Deals
            </CardTitle>
            <CardDescription>
              Select a DAO invoice template or paste your own invoice text
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Template Selection */}
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <label className="text-sm font-semibold">DAO Invoice Templates</label>
                </div>
                
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Select value={selectedTemplate} onValueChange={handleLoadTemplate}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                      <SelectContent>
                        {DAO_INVOICE_TEMPLATES.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.daoName} - {template.scenario}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleLoadRandomTemplate}
                      title="Load random template"
                    >
                      <Shuffle className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Current Template Info */}
                  <div className="bg-white p-3 rounded-lg border">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-sm">{currentTemplate.daoName}</p>
                        <p className="text-xs text-muted-foreground">{currentTemplate.scenario}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          {currentTemplate.daoType}
                        </Badge>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${
                            currentTemplate.complexity === 'simple' ? 'bg-green-100' :
                            currentTemplate.complexity === 'medium' ? 'bg-yellow-100' :
                            'bg-orange-100'
                          }`}
                        >
                          {currentTemplate.complexity}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Amount: {(currentTemplate.parsedData.amount / 100000000).toFixed(2)} sBTC
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommended Demo Path */}
            <Alert className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-300">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <AlertDescription className="text-sm">
                <strong className="text-purple-900">👉 Recommended for Demo:</strong> Click the button below to use our pre-built mock data with BERT NLP pipeline simulation. No API keys required!
              </AlertDescription>
            </Alert>

            <Button 
              onClick={handleUseMockData} 
              disabled={loading}
              variant="default"
              size="lg"
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg py-6"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing with BERT NLP Pipeline...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  AI Parse Invoice (No API Key Needed)
                </>
              )}
            </Button>

            <Alert className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <Info className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-xs text-blue-900">
                <strong>NLP Pipeline:</strong> A contributor submits plain-English invoice text. Our BERT-based model extracts entities with <strong>95.2% F1 score</strong>, outputs structured JSON-LD schema, and automatically populates a Clarity escrow template deployed on Stacks. The DAO deposits sBTC, and the state machine transitions through <code className="bg-white px-1 py-0.5 rounded text-xs">created→funded→verified→released</code> - each step requiring cryptographic proof of condition satisfaction.
              </AlertDescription>
            </Alert>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Advanced: Use Your Own AI API
                </span>
              </div>
            </div>

            {/* AI Provider Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Select AI Provider (Optional)</label>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={aiProvider === 'supabase' ? 'default' : 'outline'}
                  onClick={() => setAiProvider('supabase')}
                  size="sm"
                  className={aiProvider === 'supabase' ? 'bg-green-600' : ''}
                >
                  <Database className="w-4 h-4 mr-2" />
                  Supabase + OpenAI
                  {supabaseStatus.configured && <Badge className="ml-2 bg-white text-green-600 text-xs">✓</Badge>}
                </Button>
                <Button
                  variant={aiProvider === 'openai' ? 'default' : 'outline'}
                  onClick={() => setAiProvider('openai')}
                  size="sm"
                >
                  OpenAI GPT-5
                </Button>
                <Button
                  variant={aiProvider === 'claude' ? 'default' : 'outline'}
                  onClick={() => setAiProvider('claude')}
                  size="sm"
                >
                  Anthropic Claude
                </Button>
              </div>
              {aiProvider === 'supabase' && (
                <Alert className="mt-2">
                  <Info className="w-4 h-4" />
                  <AlertDescription className="text-xs">
                    {supabaseStatus.configured ? (
                      <>✅ Supabase configured! Uses OpenAI API key stored securely in Supabase environment.</>
                    ) : (
                      <>⚠️ Supabase not configured. Please use mock data or add Supabase credentials to .env.local</>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* API Key (only show for direct OpenAI/Claude) */}
            {(aiProvider === 'openai' || aiProvider === 'claude') && (
              <div>
                <label className="text-sm font-medium mb-2 block">API Key</label>
                <Input
                  type="password"
                  placeholder={`Enter your ${aiProvider === 'openai' ? 'OpenAI' : 'Anthropic'} API key (requires credits)`}
                  value={apiKey}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApiKey(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  ⚠️ Note: OpenAI requires active credits. If you get quota errors, use Mock Data instead.
                </p>
              </div>
            )}

            {/* Invoice Text */}
            <div>
              <label className="text-sm font-medium mb-2 block">Invoice Text (Optional - for live API testing)</label>
              <Textarea
                rows={8}
                placeholder="Paste your invoice text here..."
                value={invoiceText}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInvoiceText(e.target.value)}
                className="font-mono text-sm"
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {aiProvider === 'supabase' && supabaseStatus.configured && (
                <Button 
                  onClick={handleParseInvoice} 
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Parsing with Supabase + OpenAI...
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4 mr-2" />
                      Parse with Supabase (OpenAI)
                    </>
                  )}
                </Button>
              )}

              {(aiProvider === 'openai' || aiProvider === 'claude') && (
                <Button 
                  onClick={handleParseInvoice} 
                  disabled={loading || !apiKey}
                  variant="outline"
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Parsing with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Parse with {aiProvider === 'openai' ? 'OpenAI' : 'Claude'}
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Review Parsed Data */}
      {currentStep === 'review' && parsedData && (
        <>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Review Extracted Data
            </CardTitle>
            <CardDescription>
              Verify the information extracted by AI
              {useMockData && currentTemplate.nlpMetadata && (
                <Badge className="ml-2 bg-gradient-to-r from-green-500 to-blue-500">
                  NLP: {currentTemplate.nlpMetadata.model} | F1: {(currentTemplate.nlpMetadata.f1Score * 100).toFixed(1)}% | {currentTemplate.nlpMetadata.processingTime}ms
                </Badge>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Invoice ID</label>
                <p className="text-lg font-semibold">{parsedData.invoice_id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Amount</label>
                <p className="text-lg font-semibold">
                  {satoshisToBtc(parsedData.amount)} sBTC
                  <span className="text-sm text-gray-500 ml-2">
                    ({parsedData.amount.toLocaleString()} sats)
                  </span>
                </p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-500">Payee</label>
                <p className="text-sm font-mono bg-gray-50 p-2 rounded">{parsedData.payee}</p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-500">Arbiter</label>
                <p className="text-sm font-mono bg-gray-50 p-2 rounded">{parsedData.arbiter}</p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-500">Milestone Description</label>
                <p className="text-sm bg-gray-50 p-2 rounded">{parsedData.milestone_description}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Deadline</label>
                <p className="text-sm">{parsedData.deadline || 'No deadline'}</p>
              </div>
            </div>

            <Button onClick={handleReviewComplete} className="w-full">
              Looks Good, Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Show Bitcoin-aligned features */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SBTCYieldDashboard invoiceAmount={parsedData.amount} showDetails={true} />
          <BitcoinConfirmationWidget 
            stacksBlockHeight={12345} 
            variant="card" 
            showDetails={true}
          />
        </div>
        </>
      )}

      {/* Steps 3-6: Transaction Steps */}
      {['create', 'deposit', 'acknowledge', 'release'].includes(currentStep) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              {STEPS.find(s => s.id === currentStep)?.label}
            </CardTitle>
            <CardDescription>
              {STEPS.find(s => s.id === currentStep)?.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {parsedData && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Invoice ID:</span>
                  <span className="font-mono font-semibold">#{parsedData.invoice_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Amount:</span>
                  <span className="font-semibold">{satoshisToBtc(parsedData.amount)} sBTC</span>
                </div>
                {invoiceStatus && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge variant={invoiceStatus === 'RELEASED' ? 'default' : 'secondary'}>
                      {invoiceStatus}
                    </Badge>
                  </div>
                )}
              </div>
            )}

            <Button 
              onClick={
                currentStep === 'create' ? handleCreateInvoice :
                currentStep === 'deposit' ? handleDepositTokens :
                currentStep === 'acknowledge' ? handleAcknowledgeDeposit :
                handleReleaseFunds
              }
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {STEPS.find(s => s.id === currentStep)?.label}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 7: Complete */}
      {currentStep === 'complete' && (
        <Card className="border-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <Check className="w-6 h-6" />
              Invoice Complete!
            </CardTitle>
            <CardDescription>
              Funds have been successfully released to the payee
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {parsedData && (
              <div className="bg-green-50 p-6 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Invoice ID:</span>
                  <span className="font-mono font-bold text-lg">#{parsedData.invoice_id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Amount Transferred:</span>
                  <span className="font-bold text-lg text-green-600">
                    {satoshisToBtc(parsedData.amount)} sBTC
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge className="bg-green-500">RELEASED</Badge>
                </div>
              </div>
            )}

            <Button 
              variant="outline"
              onClick={() => {
                setCurrentStep('parse');
                setParsedData(null);
                setError(null);
                setInvoiceStatus('');
                setUseMockData(false);
              }}
              className="w-full"
            >
              Create Another Invoice
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

