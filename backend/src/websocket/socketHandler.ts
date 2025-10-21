// backend/src/websocket/socketHandler.ts
import { Server, Socket } from 'socket.io';
import { agentService } from '../services/AgentService.js';
import { User } from '../models/User.js';
import { authenticateSocket } from '../middleware/auth.js';

interface SocketData {
  walletAddress: string;
}

interface ServerToClientEvents {
  'agent:response': (data: any) => void;
  'agent:typing': (data: { isTyping: boolean }) => void;
  'agent:error': (data: { message: string; timestamp: string }) => void;
  'proposal:analysis:start': (data: { proposalId: string }) => void;
  'proposal:analysis:complete': (data: any) => void;
  'proposal:analysis:error': (data: { proposalId: string; error: string }) => void;
  'user:notification': (data: any) => void;
  'system:alert': (data: any) => void;
}

interface ClientToServerEvents {
  'agent:message': (data: { message: string; context?: any }) => void;
  'proposal:analyze': (data: { proposalId: string; daoAddress?: string }) => void;
  'user:subscribe': (data: { topics: string[] }) => void;
  'user:unsubscribe': (data: { topics: string[] }) => void;
}

export function setupWebSocket(io: Server<ClientToServerEvents, ServerToClientEvents>) {
  // Socket authentication middleware
  io.use(authenticateSocket);

  io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
    const walletAddress = socket.data.walletAddress;
    console.log(`🔌 User ${walletAddress} connected via WebSocket`);

    // Join user to their personal room
    socket.join(`user:${walletAddress}`);

    // Update user's last active timestamp
    User.findOneAndUpdate(
      { walletAddress },
      { lastActive: new Date() },
      { upsert: true }
    ).catch(console.error);

    /**
     * Handle real-time agent chat messages
     */
    socket.on('agent:message', async (data) => {
      try {
        const { message, context = {} } = data;

        if (!message?.trim()) {
          socket.emit('agent:error', {
            message: 'Message cannot be empty',
            timestamp: new Date().toISOString()
          });
          return;
        }

        console.log(`💬 WebSocket chat from ${walletAddress}: ${message.substring(0, 50)}...`);

        // Send typing indicator
        socket.emit('agent:typing', { isTyping: true });

        // Get response from agent
        const response = await agentService.chatWithAgent(
          message,
          context,
          walletAddress
        );

        // Send response
        socket.emit('agent:response', {
          id: Date.now().toString(),
          type: 'agent',
          content: response.content,
          agent: response.agent,
          actions: response.suggestedActions,
          confidence: response.confidence,
          timestamp: new Date().toISOString()
        });

        socket.emit('agent:typing', { isTyping: false });
      } catch (error) {
        console.error('WebSocket chat error:', error);
        socket.emit('agent:typing', { isTyping: false });
        socket.emit('agent:error', {
          message: error instanceof Error ? error.message : 'Failed to process message',
          timestamp: new Date().toISOString()
        });
      }
    });

    /**
     * Handle proposal analysis requests
     */
    socket.on('proposal:analyze', async (data) => {
      try {
        const { proposalId, daoAddress } = data;

        if (!proposalId) {
          socket.emit('proposal:analysis:error', {
            proposalId: '',
            error: 'Proposal ID is required'
          });
          return;
        }

        console.log(`🔍 WebSocket proposal analysis: ${proposalId}`);

        socket.emit('proposal:analysis:start', { proposalId });

        const analysis = await agentService.analyzeProposal(
          proposalId,
          walletAddress
        );

        // Track interaction
        await User.findOneAndUpdate(
          { walletAddress },
          {
            $push: {
              interactions: {
                type: 'PROPOSAL_ANALYSIS',
                proposalId,
                timestamp: new Date(),
                metadata: { via: 'websocket' }
              }
            },
            lastActive: new Date()
          },
          { upsert: true }
        );

        socket.emit('proposal:analysis:complete', {
          proposalId,
          analysis,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Proposal analysis error:', error);
        socket.emit('proposal:analysis:error', {
          proposalId: data.proposalId,
          error: error instanceof Error ? error.message : 'Failed to analyze proposal'
        });
      }
    });

    /**
     * Handle user subscribing to topics
     */
    socket.on('user:subscribe', (data) => {
      const { topics = [] } = data;
      topics.forEach(topic => {
        socket.join(`topic:${topic}`);
        console.log(`📢 ${walletAddress} subscribed to ${topic}`);
      });
    });

    /**
     * Handle user unsubscribing from topics
     */
    socket.on('user:unsubscribe', (data) => {
      const { topics = [] } = data;
      topics.forEach(topic => {
        socket.leave(`topic:${topic}`);
        console.log(`🔇 ${walletAddress} unsubscribed from ${topic}`);
      });
    });

    /**
     * Handle disconnection
     */
    socket.on('disconnect', (reason) => {
      console.log(`🔌 User ${walletAddress} disconnected: ${reason}`);

      // Update last active
      User.findOneAndUpdate(
        { walletAddress },
        { lastActive: new Date() }
      ).catch(console.error);
    });

    /**
     * Handle errors
     */
    socket.on('error', (error) => {
      console.error(`❌ Socket error for ${walletAddress}:`, error);
    });

    // Send welcome message
    socket.emit('agent:response', {
      id: 'welcome',
      type: 'system',
      content: '👋 Welcome to DAO Governance Co-pilot! How can I help you today?',
      timestamp: new Date().toISOString()
    });
  });

  /**
   * Broadcast system-wide alert
   */
  function broadcastAlert(alert: {
    type: 'info' | 'warning' | 'error' | 'success';
    title: string;
    message: string;
    metadata?: any;
  }) {
    io.emit('system:alert', {
      ...alert,
      timestamp: new Date().toISOString()
    });
    console.log(`📢 System alert broadcast: ${alert.title}`);
  }

  /**
   * Send notification to specific user
   */
  function sendUserNotification(
    walletAddress: string,
    notification: {
      type: string;
      title: string;
      message: string;
      data?: any;
    }
  ) {
    io.to(`user:${walletAddress}`).emit('user:notification', {
      ...notification,
      timestamp: new Date().toISOString()
    });
    console.log(`🔔 Notification sent to ${walletAddress}: ${notification.title}`);
  }

  /**
   * Broadcast to topic subscribers
   */
  function broadcastToTopic(
    topic: string,
    event: string,
    data: any
  ) {
    io.to(`topic:${topic}`).emit(event as any, {
      ...data,
      timestamp: new Date().toISOString()
    });
    console.log(`📡 Broadcast to topic ${topic}: ${event}`);
  }

  /**
   * Get active connections count
   */
  function getActiveConnections(): number {
    return io.sockets.sockets.size;
  }

  /**
   * Get user connection status
   */
  async function isUserConnected(walletAddress: string): Promise<boolean> {
    const sockets = await io.in(`user:${walletAddress}`).fetchSockets();
    return sockets.length > 0;
  }

  return {
    broadcastAlert,
    sendUserNotification,
    broadcastToTopic,
    getActiveConnections,
    isUserConnected
  };
}

export type WebSocketHelpers = ReturnType<typeof setupWebSocket>;

