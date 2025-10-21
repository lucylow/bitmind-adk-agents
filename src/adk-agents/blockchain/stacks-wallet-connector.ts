/**
 * Stacks Wallet Connector
 * Handles wallet connection and authentication for Stacks blockchain
 */

import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksMainnet, StacksTestnet } from '@stacks/network';
import type { StacksNetwork } from '@stacks/network';

export interface WalletConnection {
  address: string;
  publicKey: string;
  network: 'mainnet' | 'testnet';
  isConnected: boolean;
}

export class StacksWalletConnector {
  private userSession: UserSession;
  private network: StacksNetwork;
  private appConfig: AppConfig;

  constructor(network: 'mainnet' | 'testnet' = 'testnet') {
    // Configure the app
    this.appConfig = new AppConfig(['store_write', 'publish_data']);
    this.userSession = new UserSession({ appConfig: this.appConfig });
    
    // Set network
    this.network = network === 'mainnet' 
      ? new StacksMainnet() 
      : new StacksTestnet();
  }

  /**
   * Connect wallet using Stacks Connect
   */
  async connectWallet(): Promise<WalletConnection> {
    return new Promise((resolve, reject) => {
      if (this.userSession.isUserSignedIn()) {
        // Already connected
        const userData = this.userSession.loadUserData();
        resolve({
          address: userData.profile.stxAddress.testnet,
          publicKey: userData.profile.publicKey,
          network: 'testnet',
          isConnected: true,
        });
        return;
      }

      // Show connect dialog
      showConnect({
        appDetails: {
          name: 'BitMind DAO Governance Co-pilot',
          icon: window.location.origin + '/logo.png',
        },
        redirectTo: '/',
        onFinish: () => {
          const userData = this.userSession.loadUserData();
          resolve({
            address: userData.profile.stxAddress.testnet,
            publicKey: userData.profile.publicKey,
            network: 'testnet',
            isConnected: true,
          });
        },
        onCancel: () => {
          reject(new Error('User cancelled wallet connection'));
        },
        userSession: this.userSession,
      });
    });
  }

  /**
   * Disconnect wallet
   */
  async disconnectWallet(): Promise<void> {
    if (this.userSession.isUserSignedIn()) {
      this.userSession.signUserOut('/');
    }
  }

  /**
   * Get current wallet connection
   */
  getWalletConnection(): WalletConnection | null {
    if (!this.userSession.isUserSignedIn()) {
      return null;
    }

    const userData = this.userSession.loadUserData();
    return {
      address: userData.profile.stxAddress.testnet,
      publicKey: userData.profile.publicKey,
      network: 'testnet',
      isConnected: true,
    };
  }

  /**
   * Check if wallet is connected
   */
  isConnected(): boolean {
    return this.userSession.isUserSignedIn();
  }

  /**
   * Get user address
   */
  getUserAddress(): string | null {
    if (!this.userSession.isUserSignedIn()) {
      return null;
    }
    const userData = this.userSession.loadUserData();
    return userData.profile.stxAddress.testnet;
  }

  /**
   * Get network
   */
  getNetwork(): StacksNetwork {
    return this.network;
  }

  /**
   * Get user session
   */
  getUserSession(): UserSession {
    return this.userSession;
  }
}

// Singleton instance
export const walletConnector = new StacksWalletConnector('testnet');

