// backend/src/server.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import mongoose from 'mongoose';
import { env, validateEnv } from './config/env.js';
import agentRoutes from './api/routes/agent.js';
import { setupWebSocket } from './websocket/socketHandler.js';
import { agentService } from './services/AgentService.js';

// Validate environment variables
if (!validateEnv()) {
  console.error('❌ Environment validation failed. Exiting...');
  process.exit(1);
}

const app = express();
const server = createServer(app);

// Socket.IO setup with CORS
const io = new SocketServer(server, {
  cors: {
    origin: env.CORS_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: env.NODE_ENV === 'production'
}));
app.use(compression());
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging in development
if (env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: env.NODE_ENV,
    services: {
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      agents: agentService ? 'initialized' : 'not initialized'
    }
  });
});

// API version endpoint
app.get('/api/version', (req, res) => {
  res.json({
    version: '1.0.0',
    apiVersion: 'v1',
    adkVersion: '0.1.0',
    name: 'DAO Governance Co-pilot API'
  });
});

// API Routes
app.use('/api/agent', agentRoutes);

// WebSocket setup
const wsHelpers = setupWebSocket(io);

// Make WebSocket helpers available to routes
app.locals.ws = wsHelpers;

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handling middleware
app.use((error: any, req: any, res: any, next: any) => {
  console.error('❌ Unhandled error:', error);

  const status = error.status || error.statusCode || 500;
  const message = error.message || 'Internal server error';

  res.status(status).json({
    success: false,
    error: message,
    ...(env.NODE_ENV === 'development' && {
      stack: error.stack,
      details: error
    })
  });
});

/**
 * Connect to MongoDB
 */
async function connectDatabase() {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

/**
 * Initialize ADK-TS agents
 */
async function initializeAgents() {
  try {
    console.log('🤖 Initializing ADK-TS agents...');
    await agentService.initialize();
    console.log('✅ ADK-TS agents initialized');
  } catch (error) {
    console.error('❌ Failed to initialize agents:', error);
    throw error;
  }
}

/**
 * Start the server
 */
async function startServer() {
  try {
    // Connect to database
    await connectDatabase();

    // Initialize agents
    await initializeAgents();

    // Start listening
    server.listen(env.PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 DAO Governance Co-pilot Backend Server              ║
║                                                           ║
║   📍 Port: ${env.PORT.padEnd(48)}║
║   🌍 Environment: ${env.NODE_ENV.padEnd(42)}║
║   🔗 CORS Origin: ${env.CORS_ORIGIN.padEnd(42)}║
║   📅 Started: ${new Date().toISOString().padEnd(44)}║
║                                                           ║
║   Endpoints:                                              ║
║   • Health: GET /health                                   ║
║   • API: POST /api/agent/*                                ║
║   • WebSocket: ws://localhost:${env.PORT}${' '.padEnd(25)}║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

/**
 * Graceful shutdown handler
 */
async function gracefulShutdown(signal: string) {
  console.log(`\n📡 ${signal} received, shutting down gracefully...`);

  // Stop accepting new connections
  server.close(async () => {
    console.log('✅ HTTP server closed');

    try {
      // Close WebSocket connections
      io.close(() => {
        console.log('✅ WebSocket server closed');
      });

      // Shutdown agents
      await agentService.shutdown();
      console.log('✅ Agents shut down');

      // Close database connection
      await mongoose.connection.close();
      console.log('✅ Database connection closed');

      console.log('👋 Shutdown complete');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    console.error('⚠️  Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
}

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start the server
startServer().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

export { app, server, io };
