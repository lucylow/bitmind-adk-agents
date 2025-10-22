-- Migration: Add Audit & Guardrail Tables
-- Created: 2025-10-21
-- Description: Adds cryptographic audit trail and pending approvals system

-- ============================================================================
-- Audit Events (Append-Only Immutable Log)
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_events (
    id VARCHAR(255) PRIMARY KEY,
    run_id VARCHAR(255) NOT NULL,
    
    -- Agent & Model Info
    agent_id VARCHAR(100) NOT NULL,
    agent_version VARCHAR(50) NOT NULL,
    model_version VARCHAR(100) NOT NULL,
    
    -- Cryptographic Hashes
    prompt_hash VARCHAR(64) NOT NULL,  -- SHA256
    output_hash VARCHAR(64) NOT NULL,  -- SHA256
    merkle_leaf VARCHAR(64),           -- For Merkle tree
    
    -- Tool Calls & Guardrail Decisions (JSONB for PostgreSQL)
    tool_calls JSONB,
    guardrail_decisions JSONB,
    
    -- Metadata
    confidence DECIMAL(5,4),
    user_context JSONB,
    timestamp BIGINT NOT NULL,
    duration INTEGER,
    status VARCHAR(50) NOT NULL,
    error_message TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    CONSTRAINT audit_events_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_audit_run_id ON audit_events(run_id);
CREATE INDEX IF NOT EXISTS idx_audit_agent_id ON audit_events(agent_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_status ON audit_events(status);
CREATE INDEX IF NOT EXISTS idx_audit_model_version ON audit_events(model_version);

-- ============================================================================
-- Merkle Roots (Daily/Hourly Batch Verification)
-- ============================================================================

CREATE TABLE IF NOT EXISTS merkle_roots (
    id VARCHAR(255) PRIMARY KEY,
    root VARCHAR(64) NOT NULL,      -- Merkle root hash
    timestamp BIGINT NOT NULL,      -- When computed
    event_count INTEGER NOT NULL,   -- Number of events in batch
    start_date TIMESTAMP NOT NULL,  -- Batch start
    end_date TIMESTAMP NOT NULL,    -- Batch end
    
    -- Optional: IPFS/on-chain anchoring
    ipfs_hash VARCHAR(100),
    on_chain_tx VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT merkle_roots_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_merkle_timestamp ON merkle_roots(timestamp);
CREATE INDEX IF NOT EXISTS idx_merkle_date_range ON merkle_roots(start_date, end_date);

-- ============================================================================
-- Pending Approvals (Human-in-the-Loop Queue)
-- ============================================================================

CREATE TABLE IF NOT EXISTS pending_approvals (
    id VARCHAR(255) PRIMARY KEY,
    run_id VARCHAR(255) NOT NULL,
    tripwire_id VARCHAR(255) NOT NULL,
    
    -- Decision that triggered approval (JSONB)
    decision JSONB NOT NULL,
    
    -- Full context payload (JSONB)
    payload JSONB NOT NULL,
    
    -- Status tracking
    status VARCHAR(50) NOT NULL,  -- PENDING, APPROVED, REJECTED, EXPIRED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    
    -- Approval metadata
    approver_role VARCHAR(100),
    approver_signature TEXT,
    approved_at TIMESTAMP,
    rejection_reason TEXT,
    
    CONSTRAINT pending_approvals_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_pending_run_id ON pending_approvals(run_id);
CREATE INDEX IF NOT EXISTS idx_pending_status ON pending_approvals(status);
CREATE INDEX IF NOT EXISTS idx_pending_created ON pending_approvals(created_at);
CREATE INDEX IF NOT EXISTS idx_pending_expires ON pending_approvals(expires_at);

-- ============================================================================
-- Agent Runs (High-Level Tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_runs (
    id VARCHAR(255) PRIMARY KEY,
    run_id VARCHAR(255) UNIQUE NOT NULL,
    
    -- Agent info
    agent_id VARCHAR(100) NOT NULL,
    agent_version VARCHAR(50) NOT NULL,
    model_version VARCHAR(100) NOT NULL,
    
    -- User context
    user_id VARCHAR(255),
    user_role VARCHAR(100),
    
    -- Execution
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    duration INTEGER,
    status VARCHAR(50) NOT NULL,
    
    -- Results
    confidence DECIMAL(5,4),
    recommendation TEXT,
    
    -- Guardrails
    guardrail_tripped BOOLEAN DEFAULT FALSE,
    tripwire_count INTEGER DEFAULT 0,
    
    -- Costs (optional)
    token_count INTEGER,
    estimated_cost_usd DECIMAL(10,4),
    
    CONSTRAINT agent_runs_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_runs_agent_id ON agent_runs(agent_id);
CREATE INDEX IF NOT EXISTS idx_runs_status ON agent_runs(status);
CREATE INDEX IF NOT EXISTS idx_runs_started ON agent_runs(started_at);
CREATE INDEX IF NOT EXISTS idx_runs_user_id ON agent_runs(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_runs_run_id ON agent_runs(run_id);

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE audit_events IS 'Append-only immutable audit log with cryptographic hashes';
COMMENT ON COLUMN audit_events.prompt_hash IS 'SHA256 hash of system + user prompt for tamper detection';
COMMENT ON COLUMN audit_events.output_hash IS 'SHA256 hash of agent output for tamper detection';
COMMENT ON COLUMN audit_events.merkle_leaf IS 'Hash of this event for inclusion in Merkle tree';

COMMENT ON TABLE merkle_roots IS 'Merkle roots for batch verification of audit events';
COMMENT ON COLUMN merkle_roots.root IS 'Merkle root hash for tamper-evident batch verification';
COMMENT ON COLUMN merkle_roots.ipfs_hash IS 'IPFS hash if batch exported to IPFS';
COMMENT ON COLUMN merkle_roots.on_chain_tx IS 'Transaction hash if root published on-chain';

COMMENT ON TABLE pending_approvals IS 'Human-in-the-loop approval queue for high-risk operations';
COMMENT ON COLUMN pending_approvals.decision IS 'GuardrailDecision JSON with tripwire details';
COMMENT ON COLUMN pending_approvals.payload IS 'Full run context including promptHash and tool inputs';
COMMENT ON COLUMN pending_approvals.approver_signature IS 'Cryptographic signature from approver (multisig)';

COMMENT ON TABLE agent_runs IS 'High-level tracking of agent execution runs';

-- ============================================================================
-- Example Queries
-- ============================================================================

-- Get all events for a specific run
-- SELECT * FROM audit_events WHERE run_id = 'run-123' ORDER BY timestamp ASC;

-- Find all HIGH confidence decisions
-- SELECT * FROM audit_events WHERE confidence >= 0.90 AND status = 'success';

-- Get pending approvals needing governance-admin role
-- SELECT * FROM pending_approvals 
-- WHERE status = 'PENDING' 
--   AND payload->>'toolName' IN ('execute_vote', 'transfer_treasury_funds')
-- ORDER BY created_at ASC;

-- Find all runs that tripped guardrails
-- SELECT * FROM agent_runs WHERE guardrail_tripped = TRUE;

-- Get daily Merkle roots for verification
-- SELECT * FROM merkle_roots ORDER BY start_date DESC;

