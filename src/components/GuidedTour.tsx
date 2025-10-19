/**
 * Interactive Guided Tour Component
 * Helps new users understand the invoice workflow step-by-step
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Check, X, Sparkles, Play } from 'lucide-react';

export interface TourStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector for element to highlight
  action?: string; // Button text for action
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const DEFAULT_TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: '👋 Welcome to BitMindAI',
    description: 'Let\'s walk through creating a smart invoice with AI-powered parsing and Bitcoin-native escrow in just 7 steps!',
    action: 'Start Tour'
  },
  {
    id: 'template',
    title: '📄 Step 1: Select Invoice Template',
    description: 'Choose from 6 pre-built DAO templates or paste your own invoice text. Each template represents real-world scenarios from DeFi, NFT, Education, and Gaming DAOs.',
    target: '#template-selector',
    position: 'bottom'
  },
  {
    id: 'ai-parse',
    title: '🤖 Step 2: AI Invoice Parsing',
    description: 'Our AI extracts key data with 95%+ accuracy. Choose between Supabase (uses your OpenAI key securely), direct OpenAI/Claude, or instant mock data for demos.',
    target: '#ai-provider-selector',
    position: 'bottom'
  },
  {
    id: 'mock-data',
    title: '🎮 Quick Demo Option',
    description: 'For the fastest experience, click "Use Mock Data Demo" to skip AI parsing and explore the full workflow instantly—no API key needed!',
    target: '#mock-data-button',
    position: 'top'
  },
  {
    id: 'review',
    title: '✅ Step 3: Review Extracted Data',
    description: 'Verify the AI-extracted invoice details: amount, addresses, milestones, and deadline. You can manually edit any field before proceeding.',
    action: 'Next: Deploy'
  },
  {
    id: 'security',
    title: '🔒 Bitcoin-Native Security',
    description: 'Your invoice will be deployed as a Clarity smart contract on Stacks, inheriting Bitcoin\'s security. Post-conditions ensure only expected state changes occur.',
    action: 'Got it!'
  },
  {
    id: 'escrow',
    title: '💰 Trustless Escrow Flow',
    description: 'Funds are held in smart contract escrow until milestones are completed. No intermediaries, no counter-party risk. All state transitions are on-chain and transparent.',
    action: 'Nice!'
  },
  {
    id: 'complete',
    title: '🎉 You\'re All Set!',
    description: 'You now understand the complete workflow. Try it with mock data, then connect your wallet for real transactions. Need help? Check our docs or Discord community.',
    action: 'Start Creating'
  }
];

interface GuidedTourProps {
  steps?: TourStep[];
  autoStart?: boolean;
  onComplete?: () => void;
  onSkip?: () => void;
}

export function GuidedTour({ 
  steps = DEFAULT_TOUR_STEPS,
  autoStart = false,
  onComplete,
  onSkip 
}: GuidedTourProps) {
  const [isActive, setIsActive] = useState(autoStart);
  const [currentStep, setCurrentStep] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  // Keyboard navigation
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSkip();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft' && currentStep > 0) {
        setCurrentStep(currentStep - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, currentStep]);

  // Highlight target element
  useEffect(() => {
    if (!isActive || !step.target) return;

    const element = document.querySelector(step.target);
    if (element) {
      element.classList.add('tour-highlight');
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return () => {
      if (element) {
        element.classList.remove('tour-highlight');
      }
    };
  }, [isActive, step]);

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsActive(false);
    if (onComplete) onComplete();
  };

  const handleSkip = () => {
    setIsActive(false);
    if (onSkip) onSkip();
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setIsActive(true);
    setIsMinimized(false);
  };

  // Start Tour Button (when tour is not active)
  if (!isActive) {
    return (
      <Button
        onClick={handleRestart}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-40 shadow-lg bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-300 hover:border-purple-400"
      >
        <Play className="w-4 h-4 mr-2" />
        Start Guided Tour
      </Button>
    );
  }

  // Minimized state
  if (isMinimized) {
    return (
      <Button
        onClick={() => setIsMinimized(false)}
        size="sm"
        className="fixed bottom-4 right-4 z-50 shadow-xl bg-gradient-to-r from-purple-600 to-blue-600"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Resume Tour ({currentStep + 1}/{steps.length})
      </Button>
    );
  }

  // Full Tour Card
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm"
        onClick={handleSkip}
      />

      {/* Tour Card */}
      <Card className="fixed bottom-4 right-4 w-[420px] max-w-[90vw] z-50 shadow-2xl border-2 border-purple-300 animate-in slide-in-from-bottom-5">
        <CardContent className="p-0">
          {/* Progress Bar */}
          <div className="h-1 bg-gray-200 rounded-t-lg overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Content */}
          <div className="p-5">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <Badge className="mb-2 bg-gradient-to-r from-purple-600 to-blue-600">
                  Step {currentStep + 1} of {steps.length}
                </Badge>
                <h3 className="font-bold text-lg text-gray-900 mb-1">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
              <div className="flex gap-1 ml-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(true)}
                  className="h-8 w-8 p-0"
                  title="Minimize"
                >
                  _
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="h-8 w-8 p-0"
                  title="Close tour (ESC)"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Dot Indicators */}
            <div className="flex items-center gap-2 mb-4">
              {steps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentStep(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentStep ? 'w-8 bg-purple-600' :
                    idx < currentStep ? 'w-2 bg-green-500' : 
                    'w-2 bg-gray-300'
                  }`}
                  title={`Go to step ${idx + 1}`}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevious}
                disabled={isFirstStep}
                className="text-xs"
              >
                ← Previous
              </Button>

              <div className="flex gap-2">
                {!isFirstStep && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSkip}
                    className="text-xs"
                  >
                    Skip Tour
                  </Button>
                )}

                <Button
                  size="sm"
                  onClick={handleNext}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-xs"
                >
                  {isLastStep ? (
                    <>
                      {step.action || 'Complete'} <Check className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      {step.action || 'Next'} <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Keyboard Hints */}
            <div className="mt-3 pt-3 border-t flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span>← → Navigate</span>
              <span>ESC Skip</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add CSS for highlight effect */}
      <style>{`
        .tour-highlight {
          position: relative;
          z-index: 45;
          box-shadow: 0 0 0 4px rgba(147, 51, 234, 0.4), 0 0 0 8px rgba(147, 51, 234, 0.2);
          border-radius: 8px;
          transition: box-shadow 0.3s ease;
        }
      `}</style>
    </>
  );
}

/**
 * Hook to manage tour state across the app
 */
export function useGuidedTour() {
  const [hasCompletedTour, setHasCompletedTour] = useState(() => {
    return localStorage.getItem('bitmind-tour-completed') === 'true';
  });

  const markTourComplete = () => {
    localStorage.setItem('bitmind-tour-completed', 'true');
    setHasCompletedTour(true);
  };

  const resetTour = () => {
    localStorage.removeItem('bitmind-tour-completed');
    setHasCompletedTour(false);
  };

  return {
    hasCompletedTour,
    markTourComplete,
    resetTour,
    shouldShowTour: !hasCompletedTour
  };
}

