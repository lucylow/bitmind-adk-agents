// backend/src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface AuthenticatedRequest extends Request {
  walletAddress?: string;
  userId?: string;
}

/**
 * Middleware to authenticate wallet signatures
 */
export async function authenticateWallet(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const signature = req.headers['x-signature'] as string;
    const message = req.headers['x-message'] as string;
    const walletAddress = req.headers['x-wallet-address'] as string;

    if (!signature || !message || !walletAddress) {
      return res.status(401).json({
        success: false,
        error: 'Authentication headers required',
        required: ['x-signature', 'x-message', 'x-wallet-address']
      });
    }

    // Verify the message isn't too old (5 minutes)
    const messageData = parseAuthMessage(message);
    if (messageData) {
      const messageTime = new Date(messageData.timestamp).getTime();
      const currentTime = Date.now();
      const fiveMinutes = 5 * 60 * 1000;

      if (currentTime - messageTime > fiveMinutes) {
        return res.status(401).json({
          success: false,
          error: 'Authentication message expired'
        });
      }
    }

    // Verify signature
    const recoveredAddress = ethers.verifyMessage(message, signature);

    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(401).json({
        success: false,
        error: 'Invalid signature'
      });
    }

    req.walletAddress = walletAddress.toLowerCase();
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({
      success: false,
      error: 'Authentication failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Optional authentication - doesn't fail if not authenticated
 */
export async function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const signature = req.headers['x-signature'] as string;
    const message = req.headers['x-message'] as string;
    const walletAddress = req.headers['x-wallet-address'] as string;

    if (signature && message && walletAddress) {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      if (recoveredAddress.toLowerCase() === walletAddress.toLowerCase()) {
        req.walletAddress = walletAddress.toLowerCase();
      }
    }

    next();
  } catch (error) {
    // Don't fail on optional auth errors
    next();
  }
}

/**
 * WebSocket authentication
 */
export async function authenticateSocket(socket: any, next: any) {
  try {
    const token = socket.handshake.auth.token;
    const walletAddress = socket.handshake.auth.walletAddress;
    const signature = socket.handshake.auth.signature;
    const message = socket.handshake.auth.message;

    if (!walletAddress) {
      return next(new Error('Wallet address required'));
    }

    // Verify signature if provided
    if (signature && message) {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        return next(new Error('Invalid signature'));
      }
    }

    socket.data.walletAddress = walletAddress.toLowerCase();
    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Authentication failed'));
  }
}

/**
 * Generate JWT token for authenticated users
 */
export function generateAuthToken(walletAddress: string): string {
  return jwt.sign(
    { walletAddress: walletAddress.toLowerCase() },
    env.JWT_SECRET,
    { expiresIn: '24h' }
  );
}

/**
 * Verify JWT token
 */
export function verifyAuthToken(token: string): { walletAddress: string } | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { walletAddress: string };
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Parse authentication message to extract data
 */
function parseAuthMessage(message: string): { timestamp: string } | null {
  try {
    // Expected format: "Sign this message to authenticate: [timestamp]"
    const timestampMatch = message.match(/\[(.*?)\]/);
    if (timestampMatch && timestampMatch[1]) {
      return { timestamp: timestampMatch[1] };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Rate limiting middleware
 */
export function createRateLimiter() {
  const requests = new Map<string, number[]>();

  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const identifier = req.walletAddress || req.ip || 'unknown';
    const now = Date.now();
    const windowMs = parseInt(env.RATE_LIMIT_WINDOW_MS);
    const maxRequests = parseInt(env.RATE_LIMIT_MAX_REQUESTS);

    if (!requests.has(identifier)) {
      requests.set(identifier, []);
    }

    const userRequests = requests.get(identifier)!;
    const recentRequests = userRequests.filter(time => now - time < windowMs);

    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    recentRequests.push(now);
    requests.set(identifier, recentRequests);

    // Cleanup old entries periodically
    if (Math.random() < 0.01) {
      for (const [key, times] of requests.entries()) {
        const recent = times.filter(time => now - time < windowMs);
        if (recent.length === 0) {
          requests.delete(key);
        } else {
          requests.set(key, recent);
        }
      }
    }

    next();
  };
}
