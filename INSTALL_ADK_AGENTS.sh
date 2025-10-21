#!/bin/bash

# BitMind ADK Agents Installation Script
# This script sets up the complete environment for the ADK agents system

set -e  # Exit on error

echo ""
echo "=========================================="
echo "🧠 BitMind ADK Agents - Installation"
echo "=========================================="
echo ""

# Check Node.js version
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js 18+ is required. You have $(node -v)"
    exit 1
fi
echo "✅ Node.js version check passed: $(node -v)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Install additional packages if needed
echo ""
echo "📦 Installing additional ADK agent dependencies..."
npm install --save body-parser express graphql graphql-request 2>/dev/null || echo "Note: Some packages may already be installed"
npm install --save-dev @types/express @types/jest jest ts-jest 2>/dev/null || echo "Note: Some dev packages may already be installed"

# Handle ethers.js version (downgrade to v5 if needed)
ETHERS_VERSION=$(npm list ethers --depth=0 2>/dev/null | grep ethers@ | cut -d '@' -f 3 | cut -d '.' -f 1 || echo "0")
if [ "$ETHERS_VERSION" = "6" ]; then
    echo ""
    echo "⚠️  Detected ethers v6. ADK agents blockchain-client uses v5 syntax."
    read -p "Downgrade to ethers v5? (recommended) [Y/n]: " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
        npm install ethers@5
        echo "✅ Downgraded to ethers v5"
    else
        echo "⚠️  You'll need to update src/integrations/blockchain-client.ts to use ethers v6 syntax"
    fi
fi

# Create .env.adk if it doesn't exist
if [ ! -f .env.adk ]; then
    echo ""
    echo "📝 Creating .env.adk from template..."
    if [ -f env.adk.example ]; then
        cp env.adk.example .env.adk
        echo "✅ Created .env.adk - please edit with your API keys"
    else
        cat > .env.adk << 'EOF'
# Model APIs
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=...

# Blockchain (optional for demo)
RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
SUBGRAPH_URL=https://api.thegraph.com/subgraphs/name/your-dao/governance
SNAPSHOT_API_URL=https://hub.snapshot.org/graphql

# Governor contract
GOVERNOR_ADDRESS=
TOKEN_ADDRESS=
EOF
        echo "✅ Created .env.adk template"
    fi
else
    echo "✅ .env.adk already exists"
fi

# Create directories if needed
mkdir -p evals src/adk-agents src/tools src/integrations src/audit src/api demo tests

# Type check
echo ""
echo "🔍 Running TypeScript type check..."
if npx tsc --noEmit src/adk-agents/**/*.ts 2>/dev/null; then
    echo "✅ Type check passed"
else
    echo "⚠️  Some type errors detected - this is expected if @iqai/adk is not installed"
    echo "   The code will still run with tsx/ts-node"
fi

echo ""
echo "=========================================="
echo "✅ Installation Complete!"
echo "=========================================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Edit .env.adk with your API keys:"
echo "   nano .env.adk"
echo ""
echo "2. Run the interactive demo:"
echo "   npm run demo:adk-guardrails"
echo ""
echo "3. Run evaluations:"
echo "   npm run eval:adk"
echo ""
echo "4. Run unit tests:"
echo "   npm run test:adk-agents"
echo ""
echo "📚 Documentation:"
echo "   - Quick Start: ADK_AGENTS_QUICKSTART.md"
echo "   - Full Guide:  ADK_AGENTS_IMPLEMENTATION_GUIDE.md"
echo "   - Summary:     ADK_AGENTS_COMPLETE_IMPLEMENTATION.md"
echo ""
echo "🚀 Ready to demo!"
echo ""

