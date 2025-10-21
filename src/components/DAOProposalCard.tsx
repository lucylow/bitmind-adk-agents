/**
 * DAO Proposal Card Component
 * Displays proposal with AI analysis and voting UI
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ThumbsUp, ThumbsDown, Minus, Wallet } from 'lucide-react';
import { createDAOCopilot } from '@/adk-agents/integration/dao-copilot-api';
import { walletConnector } from '@/adk-agents/blockchain/stacks-wallet-connector';
import { daoGovernanceContract } from '@/adk-agents/blockchain/stacks-contract-caller';

interface DAOProposalCardProps {
  proposalId: string;
  daoAddress: string;
}

export const DAOProposalCard: React.FC<DAOProposalCardProps> = ({
  proposalId,
  daoAddress,
}) => {
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<any>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);
  const [voteResult, setVoteResult] = useState<any>(null);

  useEffect(() => {
    loadAnalysis();
    checkWalletConnection();
  }, [proposalId]);

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      
      const copilot = await createDAOCopilot({
        daoAddress,
        enableContinuousMonitoring: false,
      });

      const result = await copilot.analyzeProposal({
        proposalId,
        userAddress: walletAddress || 'SP2X...ANONYMOUS',
        userPreferences: {
          riskTolerance: 'moderate',
        },
      });

      setAnalysis(result);
      await copilot.shutdown();
    } catch (error) {
      console.error('Failed to load analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkWalletConnection = () => {
    const connection = walletConnector.getWalletConnection();
    if (connection) {
      setWalletAddress(connection.address);
    }
  };

  const connectWallet = async () => {
    try {
      const connection = await walletConnector.connectWallet();
      setWalletAddress(connection.address);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const castVote = async (support: 'for' | 'against' | 'abstain') => {
    if (!walletAddress) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      setVoting(true);

      const result = await daoGovernanceContract.castVote({
        proposalId: parseInt(proposalId),
        support,
        reason: `Voting based on AI recommendation (Confidence: ${
          analysis.explainability.confidence * 100
        }%)`,
      });

      setVoteResult({
        success: true,
        txId: result.txId,
        support,
      });

      // Reload analysis after voting
      setTimeout(() => loadAnalysis(), 2000);
    } catch (error) {
      setVoteResult({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cast vote',
      });
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Analyzing proposal with AI...</span>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card className="w-full">
        <CardContent className="py-12">
          <Alert>
            <AlertDescription>Failed to load proposal analysis</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const recommendation = analysis.votingRecommendation.output?.recommendation || 'ABSTAIN';
  const confidence = analysis.explainability.confidence * 100;

  const getRecommendationColor = () => {
    if (recommendation === 'FOR') return 'text-green-600 bg-green-50';
    if (recommendation === 'AGAINST') return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getRecommendationIcon = () => {
    if (recommendation === 'FOR') return <ThumbsUp className="h-5 w-5" />;
    if (recommendation === 'AGAINST') return <ThumbsDown className="h-5 w-5" />;
    return <Minus className="h-5 w-5" />;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-2xl">
              {analysis.proposalAnalysis.output?.proposal?.title || 'Proposal Title'}
            </CardTitle>
            <CardDescription className="mt-2">
              {analysis.proposalAnalysis.output?.proposal?.description ||
                'Proposal description'}
            </CardDescription>
          </div>
          <Badge variant={analysis.approvalRequired ? 'destructive' : 'default'}>
            {analysis.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* AI Recommendation */}
        <div className={`rounded-lg p-4 ${getRecommendationColor()}`}>
          <div className="flex items-center gap-2 mb-2">
            {getRecommendationIcon()}
            <h3 className="font-semibold text-lg">
              AI Recommendation: {recommendation}
            </h3>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium">Confidence:</span>
            <Progress value={confidence} className="flex-1 h-2" />
            <span className="text-sm font-medium">{confidence.toFixed(1)}%</span>
          </div>
          {analysis.approvalRequired && (
            <Alert className="mt-2">
              <AlertDescription>
                ⚠️ This recommendation requires human review due to{' '}
                {confidence < 90 ? 'low confidence' : 'high risk factors'}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Top Reasons */}
        <div>
          <h4 className="font-semibold mb-2">📝 Key Reasoning:</h4>
          <ul className="space-y-1">
            {analysis.explainability.topReasons.map((reason: string, i: number) => (
              <li key={i} className="text-sm flex items-start gap-2">
                <span className="font-medium text-blue-600">{i + 1}.</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Risk Factors */}
        {analysis.explainability.riskFactors.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">⚠️ Risk Factors:</h4>
            <ul className="space-y-1">
              {analysis.explainability.riskFactors.map((risk: string, i: number) => (
                <li key={i} className="text-sm text-red-600">
                  • {risk}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Alternative Views */}
        {analysis.explainability.alternativeViews.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">🤔 Alternative Perspectives:</h4>
            <ul className="space-y-1">
              {analysis.explainability.alternativeViews.map(
                (view: string, i: number) => (
                  <li key={i} className="text-sm text-gray-600">
                    • {view}
                  </li>
                )
              )}
            </ul>
          </div>
        )}

        {/* Vote Result */}
        {voteResult && (
          <Alert variant={voteResult.success ? 'default' : 'destructive'}>
            <AlertDescription>
              {voteResult.success ? (
                <>
                  ✅ Vote cast successfully!{' '}
                  <a
                    href={`https://explorer.stacks.co/txid/${voteResult.txId}?chain=testnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    View transaction
                  </a>
                </>
              ) : (
                `❌ Failed to cast vote: ${voteResult.error}`
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        {!walletAddress ? (
          <Button onClick={connectWallet} className="flex-1">
            <Wallet className="h-4 w-4 mr-2" />
            Connect Wallet to Vote
          </Button>
        ) : (
          <>
            <Button
              onClick={() => castVote('for')}
              disabled={voting}
              variant="default"
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {voting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Vote FOR
                </>
              )}
            </Button>
            <Button
              onClick={() => castVote('against')}
              disabled={voting}
              variant="destructive"
              className="flex-1"
            >
              {voting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  Vote AGAINST
                </>
              )}
            </Button>
            <Button
              onClick={() => castVote('abstain')}
              disabled={voting}
              variant="outline"
              className="flex-1"
            >
              {voting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Minus className="h-4 w-4 mr-2" />
                  Abstain
                </>
              )}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default DAOProposalCard;

