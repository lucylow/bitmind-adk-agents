import React, { useState } from 'react';
import { useAdkAgent } from '../hooks/useAdkAgent';
import { AlertCircle, CheckCircle, Clock, TrendingDown } from 'lucide-react';

/**
 * ADK Governance Analyzer Component
 * Displays proposal analysis and voting recommendations from ADK agents
 */

export const AdkGovernanceAnalyzer: React.FC = () => {
  const [proposalId, setProposalId] = useState('proposal-mock-001');
  const [daoAddress, setDaoAddress] = useState('0xDAOADDRESS');
  const { loading, error, data, analyzeProposal } = useAdkAgent();

  const handleAnalyze = async () => {
    try {
      await analyzeProposal(proposalId, daoAddress, {
        riskTolerance: 'medium',
      });
    } catch (err) {
      console.error('Analysis failed:', err);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg border border-slate-700">
      <h2 className="text-2xl font-bold text-white mb-6">
        🤖 ADK Governance Analyzer
      </h2>

      {/* Input Section */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Proposal ID
          </label>
          <input
            type="text"
            value={proposalId}
            onChange={(e) => setProposalId(e.target.value)}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            placeholder="e.g., proposal-123"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            DAO Address
          </label>
          <input
            type="text"
            value={daoAddress}
            onChange={(e) => setDaoAddress(e.target.value)}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            placeholder="e.g., 0xDAOADDRESS"
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-medium rounded transition-colors"
        >
          {loading ? 'Analyzing...' : 'Analyze Proposal'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-300">Error</h3>
            <p className="text-sm text-red-200">{error.message}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="mb-6 p-4 bg-blue-900/20 border border-blue-700 rounded flex items-center gap-3">
          <Clock className="w-5 h-5 text-blue-400 animate-spin" />
          <p className="text-blue-200">Analyzing proposal with ADK agents...</p>
        </div>
      )}

      {/* Results Display */}
      {data && !loading && (
        <div className="space-y-6">
          {/* Proposal Analysis */}
          {data.proposalAnalysis && (
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">
                📋 Proposal Analysis
              </h3>
              <div className="space-y-2 text-sm text-slate-300">
                <p>
                  <span className="font-medium">Title:</span>{' '}
                  {data.proposalAnalysis.proposal.title}
                </p>
                <p>
                  <span className="font-medium">Status:</span>{' '}
                  {data.proposalAnalysis.proposal.status}
                </p>
                <p>
                  <span className="font-medium">Financial Impact:</span>{' '}
                  {(data.proposalAnalysis.financialImpact.treasuryImpact * 100).toFixed(2)}%
                </p>
                <p>
                  <span className="font-medium">Risk Score:</span>{' '}
                  {(data.proposalAnalysis.financialImpact.riskScore * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          )}

          {/* Voting Recommendation */}
          {data.votingRecommendation && (
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Voting Recommendation
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Recommendation</p>
                  <p className="text-xl font-bold text-green-400">
                    {data.votingRecommendation.recommendation}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Confidence</p>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${data.votingRecommendation.confidence * 100}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    {(data.votingRecommendation.confidence * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-2">Reasoning</p>
                  <ul className="space-y-1">
                    {data.votingRecommendation.reasoning.map(
                      (reason: string, idx: number) => (
                        <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                          <span className="text-green-400 mt-1">•</span>
                          {reason}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Treasury Status */}
          {data.treasuryStatus && (
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-blue-400" />
                Treasury Status
              </h3>
              <div className="space-y-2 text-sm text-slate-300">
                <p>
                  <span className="font-medium">Total Value:</span> $
                  {(data.treasuryStatus.totalValue / 1000000).toFixed(1)}M
                </p>
                <p>
                  <span className="font-medium">Health Score:</span>{' '}
                  {(data.treasuryStatus.healthScore * 100).toFixed(0)}%
                </p>
                {data.treasuryStatus.alerts.length > 0 && (
                  <div>
                    <p className="font-medium text-yellow-400">Alerts:</p>
                    <ul className="ml-4 space-y-1">
                      {data.treasuryStatus.alerts.map((alert: string, idx: number) => (
                        <li key={idx} className="text-yellow-300">• {alert}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!data && !loading && !error && (
        <div className="text-center py-8 text-slate-400">
          <p>Enter proposal details and click "Analyze Proposal" to get started</p>
        </div>
      )}
    </div>
  );
};

export default AdkGovernanceAnalyzer;

