import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Users, CheckCircle, XCircle, Clock, Shield, Vote } from 'lucide-react';
import { useWalletStore } from '@/store/useWalletStore';
const MultisigTreasury = () => {
    const { isConnected } = useWalletStore();
    const [showCreateProposal, setShowCreateProposal] = useState(false);
    const [newProposal, setNewProposal] = useState({
        title: '',
        description: '',
        amount: '',
        recipient: ''
    });
    const proposals = [
        {
            id: 1,
            title: 'Smart Contract Audit Payment',
            description: 'Payment for Q4 security audit by CertiK',
            amount: 0.85,
            recipient: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
            proposedBy: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
            status: 'voting',
            votesFor: 3,
            votesAgainst: 0,
            threshold: 3,
            deadline: '2025-11-15'
        },
        {
            id: 2,
            title: 'Marketing Campaign Budget',
            description: 'Q1 2026 marketing and community growth initiatives',
            amount: 1.2,
            recipient: 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE',
            proposedBy: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
            status: 'approved',
            votesFor: 5,
            votesAgainst: 0,
            threshold: 3,
            deadline: '2025-11-01'
        },
        {
            id: 3,
            title: 'Developer Grants Program',
            description: 'Fund ecosystem development grants',
            amount: 2.5,
            recipient: 'SP2H8PY27SEZ03MWRKS5XABZYQN17ETGQS3527SA5',
            proposedBy: 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE',
            status: 'voting',
            votesFor: 2,
            votesAgainst: 1,
            threshold: 3,
            deadline: '2025-11-20'
        }
    ];
    const signers = [
        { address: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', name: 'Alice', weight: 1, hasVoted: true, vote: 'approve' },
        { address: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7', name: 'Bob', weight: 1, hasVoted: true, vote: 'approve' },
        { address: 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE', name: 'Charlie', weight: 1, hasVoted: false },
        { address: 'SP2H8PY27SEZ03MWRKS5XABZYQN17ETGQS3527SA5', name: 'Diana', weight: 1, hasVoted: true, vote: 'approve' },
        { address: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9', name: 'Eve', weight: 1, hasVoted: false }
    ];
    const createProposal = async () => {
        if (!isConnected) {
            alert('Please connect your wallet first');
            return;
        }
        if (!newProposal.title || !newProposal.amount || !newProposal.recipient) {
            alert('Please fill all required fields');
            return;
        }
        try {
            // In production, call smart contract
            alert('Proposal created successfully!');
            setShowCreateProposal(false);
            setNewProposal({ title: '', description: '', amount: '', recipient: '' });
        }
        catch (error) {
            console.error('Failed to create proposal:', error);
            alert('Failed to create proposal: ' + error.message);
        }
    };
    const voteOnProposal = async (proposalId, approve) => {
        if (!isConnected) {
            alert('Please connect your wallet first');
            return;
        }
        try {
            // In production, call smart contract
            alert(`Vote ${approve ? 'approved' : 'rejected'} successfully!`);
        }
        catch (error) {
            console.error('Failed to vote:', error);
            alert('Failed to vote: ' + error.message);
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'voting': return 'bg-blue-600';
            case 'approved': return 'bg-green-600';
            case 'rejected': return 'bg-red-600';
            case 'executed': return 'bg-purple-600';
            default: return 'bg-gray-600';
        }
    };
    return (_jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsxs("div", { className: "mb-8", children: [_jsxs("h1", { className: "text-4xl font-bold mb-2 flex items-center gap-3", children: [_jsx(Users, { className: "w-10 h-10 text-blue-600" }), "MultiSig Treasury"] }), _jsx("p", { className: "text-muted-foreground text-lg", children: "3-of-5 approval workflow for secure DAO funding" })] }), _jsxs("div", { className: "grid md:grid-cols-4 gap-4 mb-8", children: [_jsx(Card, { className: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200", children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-blue-700", children: "Treasury Balance" }), _jsx("p", { className: "text-3xl font-bold text-blue-900", children: "12.5 sBTC" })] }), _jsx(Shield, { className: "w-12 h-12 text-blue-400" })] }) }) }), _jsx(Card, { className: "bg-gradient-to-br from-green-50 to-green-100 border-green-200", children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-green-700", children: "Total Proposals" }), _jsx("p", { className: "text-3xl font-bold text-green-900", children: "247" })] }), _jsx(Vote, { className: "w-12 h-12 text-green-400" })] }) }) }), _jsx(Card, { className: "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200", children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-purple-700", children: "Active Signers" }), _jsx("p", { className: "text-3xl font-bold text-purple-900", children: signers.length })] }), _jsx(Users, { className: "w-12 h-12 text-purple-400" })] }) }) }), _jsx(Card, { className: "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200", children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-orange-700", children: "Approval Threshold" }), _jsx("p", { className: "text-3xl font-bold text-orange-900", children: "3/5" })] }), _jsx(CheckCircle, { className: "w-12 h-12 text-orange-400" })] }) }) })] }), _jsx("div", { className: "mb-6", children: _jsx(Button, { onClick: () => setShowCreateProposal(!showCreateProposal), children: showCreateProposal ? 'Cancel' : 'Create New Proposal' }) }), showCreateProposal && (_jsxs(Card, { className: "mb-6 border-2 border-blue-200", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Create New Proposal" }), _jsx(CardDescription, { children: "Submit a payment proposal for DAO approval" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium mb-2 block", children: "Title" }), _jsx(Input, { placeholder: "e.g., Q4 Marketing Budget", value: newProposal.title, onChange: (e) => setNewProposal({ ...newProposal, title: e.target.value }) })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium mb-2 block", children: "Description" }), _jsx(Textarea, { placeholder: "Detailed description of the proposal", value: newProposal.description, onChange: (e) => setNewProposal({ ...newProposal, description: e.target.value }), rows: 4 })] }), _jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium mb-2 block", children: "Amount (sBTC)" }), _jsx(Input, { type: "number", placeholder: "0.00", value: newProposal.amount, onChange: (e) => setNewProposal({ ...newProposal, amount: e.target.value }), step: "0.01" })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium mb-2 block", children: "Recipient Address" }), _jsx(Input, { placeholder: "SP...", value: newProposal.recipient, onChange: (e) => setNewProposal({ ...newProposal, recipient: e.target.value }) })] })] }), _jsx(Button, { onClick: createProposal, className: "w-full", children: "Submit Proposal" })] })] })), _jsxs("div", { className: "space-y-4 mb-8", children: [_jsx("h2", { className: "text-2xl font-bold", children: "Active Proposals" }), proposals.map((proposal) => (_jsxs(Card, { className: "hover:shadow-lg transition-shadow", children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { children: proposal.title }), _jsx(Badge, { className: getStatusColor(proposal.status), children: proposal.status.toUpperCase() })] }), _jsx(CardDescription, { children: proposal.description })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid md:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Amount" }), _jsxs("p", { className: "text-2xl font-bold text-green-600", children: [proposal.amount, " sBTC"] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Votes" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-2xl font-bold text-green-600", children: proposal.votesFor }), _jsx("span", { className: "text-muted-foreground", children: "/" }), _jsx("span", { className: "text-2xl font-bold text-red-600", children: proposal.votesAgainst })] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Threshold" }), _jsxs("p", { className: "text-2xl font-bold", children: [proposal.threshold, " required"] })] })] }), _jsxs("div", { className: "p-4 bg-gray-50 rounded-lg space-y-2 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-muted-foreground", children: "Recipient:" }), _jsxs("span", { className: "font-mono", children: [proposal.recipient.substring(0, 12), "..."] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-muted-foreground", children: "Proposed by:" }), _jsxs("span", { className: "font-mono", children: [proposal.proposedBy.substring(0, 12), "..."] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-muted-foreground", children: "Deadline:" }), _jsx("span", { className: "font-semibold", children: proposal.deadline })] })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-sm mb-2", children: [_jsx("span", { children: "Progress to threshold" }), _jsxs("span", { className: "font-semibold", children: [proposal.votesFor, "/", proposal.threshold] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-3", children: _jsx("div", { className: `h-3 rounded-full ${proposal.votesFor >= proposal.threshold ? 'bg-green-600' : 'bg-blue-600'}`, style: { width: `${(proposal.votesFor / proposal.threshold) * 100}%` } }) })] }), proposal.status === 'voting' && (_jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { className: "flex-1 bg-green-600 hover:bg-green-700", onClick: () => voteOnProposal(proposal.id, true), children: [_jsx(CheckCircle, { className: "w-4 h-4 mr-2" }), "Approve"] }), _jsxs(Button, { variant: "destructive", className: "flex-1", onClick: () => voteOnProposal(proposal.id, false), children: [_jsx(XCircle, { className: "w-4 h-4 mr-2" }), "Reject"] })] })), proposal.status === 'approved' && (_jsx(Button, { className: "w-full", children: "Execute Payment" }))] })] }, proposal.id)))] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "DAO Signers" }), _jsx(CardDescription, { children: "Authorized members with voting rights" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: signers.map((signer, index) => (_jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg hover:bg-accent", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center", children: _jsx("span", { className: "font-bold text-purple-600", children: signer.name[0] }) }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold", children: signer.name }), _jsxs("p", { className: "text-sm text-muted-foreground font-mono", children: [signer.address.substring(0, 16), "..."] })] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs(Badge, { variant: "outline", children: ["Weight: ", signer.weight] }), signer.hasVoted ? (_jsx(Badge, { className: signer.vote === 'approve' ? 'bg-green-600' : 'bg-red-600', children: signer.vote === 'approve' ? '✓ Approved' : '✗ Rejected' })) : (_jsxs(Badge, { variant: "outline", className: "text-gray-600", children: [_jsx(Clock, { className: "w-3 h-3 mr-1" }), "Pending"] }))] })] }, index))) }) })] })] }));
};
export default MultisigTreasury;
