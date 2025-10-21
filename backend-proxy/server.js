/**
 * CopilotKit Proxy Server for BitMind DAO Governance
 * 
 * This Express server bridges your Vite frontend with ADK-TS agents
 * using the AG-UI protocol via CopilotKit.
 * 
 * Run: npm run dev
 * Endpoint: http://localhost:3001/api/copilotkit
 */

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for Vite dev server
app.use(cors({
  origin: 'http://localhost:5173', // Vite default port
  credentials: true,
}));

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'bitmind-copilotkit-proxy' });
});

/**
 * CopilotKit endpoint - AG-UI Protocol handler
 * 
 * This endpoint receives messages from CopilotKit frontend components
 * and forwards them to your ADK-TS backend.
 */
app.post('/api/copilotkit', async (req, res) => {
  try {
    console.log('📩 Received CopilotKit request:', {
      messages: req.body.messages?.length || 0,
      state: Object.keys(req.body.state || {}),
    });

    const { messages, state } = req.body;
    
    // Extract last user message
    const lastMessage = messages[messages.length - 1];
    
    // Forward to ADK-TS backend
    const ADK_BACKEND_URL = process.env.ADK_BACKEND_URL || 'http://localhost:8000';
    
    const response = await fetch(`${ADK_BACKEND_URL}/api/adk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        state,
        userMessage: lastMessage.content,
      }),
    });

    if (!response.ok) {
      throw new Error(`ADK Backend error: ${response.statusText}`);
    }

    const agentResponse = await response.json();
    
    console.log('✅ Forwarded to ADK backend, got response');
    
    res.json(agentResponse);
  } catch (error) {
    console.error('❌ Proxy error:', error);
    
    // Fallback response when backend is unavailable
    res.json({
      messages: [{
        role: 'assistant',
        content: `I'm having trouble connecting to the agent backend. Error: ${error.message}. Please ensure the ADK backend is running on ${process.env.ADK_BACKEND_URL || 'http://localhost:8000'}.`,
      }],
      state: req.body.state || {},
    });
  }
});

/**
 * Direct agent call (bypass CopilotKit for testing)
 */
app.post('/api/analyze-proposal', async (req, res) => {
  try {
    const { proposalId, daoAddress, preferences } = req.body;
    
    const ADK_BACKEND_URL = process.env.ADK_BACKEND_URL || 'http://localhost:8000';
    const response = await fetch(`${ADK_BACKEND_URL}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proposalId, daoAddress, preferences }),
    });

    const result = await response.json();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 CopilotKit Proxy Server running!`);
  console.log(`   Local:    http://localhost:${PORT}`);
  console.log(`   Endpoint: http://localhost:${PORT}/api/copilotkit`);
  console.log(`   ADK Backend: ${process.env.ADK_BACKEND_URL || 'http://localhost:8000'}`);
  console.log(`\n📝 Make sure to set VITE_COPILOT_URL=http://localhost:${PORT}/api/copilotkit in your .env\n`);
});

