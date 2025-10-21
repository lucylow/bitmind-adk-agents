// src/hooks/useAgentChat.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { agentApiService, AgentMessage } from '../services/AgentApiService';

export interface UseAgentChatOptions {
  walletAddress: string | null;
  signature?: string;
  authMessage?: string;
  autoConnect?: boolean;
}

export interface UseAgentChatReturn {
  messages: AgentMessage[];
  sendMessage: (content: string, context?: any) => void;
  clearMessages: () => void;
  isConnected: boolean;
  isTyping: boolean;
  error: string | null;
  reconnect: () => Promise<void>;
}

export function useAgentChat(options: UseAgentChatOptions): UseAgentChatReturn {
  const { walletAddress, signature, authMessage, autoConnect = true } = options;

  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesRef = useRef<AgentMessage[]>([]);

  // Update ref when messages change
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  /**
   * Initialize WebSocket connection
   */
  const initializeConnection = useCallback(async () => {
    if (!walletAddress || !signature || !authMessage) {
      console.log('Missing authentication credentials');
      return;
    }

    try {
      setError(null);
      await agentApiService.initializeSocket(walletAddress, signature, authMessage);
      setIsConnected(true);
      console.log('✅ Agent chat connected');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect';
      setError(errorMessage);
      setIsConnected(false);
      console.error('❌ Failed to connect agent chat:', err);
    }
  }, [walletAddress, signature, authMessage]);

  /**
   * Setup event listeners
   */
  useEffect(() => {
    if (!walletAddress) return;

    // Handler for agent responses
    const handleAgentResponse = (data: AgentMessage) => {
      setMessages(prev => [...prev, data]);
    };

    // Handler for typing indicator
    const handleTyping = (data: { isTyping: boolean }) => {
      setIsTyping(data.isTyping);
    };

    // Handler for errors
    const handleError = (data: { message: string; timestamp: string }) => {
      setError(data.message);
      console.error('Agent error:', data.message);
    };

    // Register event handlers
    agentApiService.on('agent:response', handleAgentResponse);
    agentApiService.on('agent:typing', handleTyping);
    agentApiService.on('agent:error', handleError);

    // Initialize connection if auto-connect is enabled
    if (autoConnect && signature && authMessage) {
      initializeConnection();
    }

    // Cleanup
    return () => {
      agentApiService.off('agent:response', handleAgentResponse);
      agentApiService.off('agent:typing', handleTyping);
      agentApiService.off('agent:error', handleError);
    };
  }, [walletAddress, signature, authMessage, autoConnect, initializeConnection]);

  /**
   * Send a message to the agent
   */
  const sendMessage = useCallback((content: string, context: any = {}) => {
    if (!isConnected) {
      setError('Not connected to agent service');
      console.error('Cannot send message: not connected');
      return;
    }

    if (!content.trim()) {
      setError('Message cannot be empty');
      return;
    }

    try {
      // Add user message to chat
      const userMessage: AgentMessage = {
        id: `user-${Date.now()}`,
        type: 'user',
        content: content.trim(),
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, userMessage]);
      setError(null);

      // Send to agent via WebSocket
      agentApiService.sendMessage(content.trim(), context);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      console.error('Error sending message:', err);
    }
  }, [isConnected]);

  /**
   * Clear message history
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  /**
   * Reconnect to agent service
   */
  const reconnect = useCallback(async () => {
    agentApiService.disconnect();
    setIsConnected(false);
    await initializeConnection();
  }, [initializeConnection]);

  return {
    messages,
    sendMessage,
    clearMessages,
    isConnected,
    isTyping,
    error,
    reconnect
  };
}

