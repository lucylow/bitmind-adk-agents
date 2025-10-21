// src/tools/wallet-tools.ts
import { tool } from "@iqai/adk";
import { ethers } from "ethers";
import { z } from "zod";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const connectWalletTool = tool({
  description: "Connect to user's Ethereum wallet to enable blockchain interactions",
  input: z.object({}),
  execute: async ({}): Promise<{ address: string; connected: boolean }> => {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error("Ethereum wallet not found. Please install MetaMask.");
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      return {
        address: accounts[0],
        connected: true
      };
    } catch (error) {
      throw new Error(`Failed to connect wallet: ${error}`);
    }
  }
});

export const getWalletBalanceTool = tool({
  description: "Get ETH balance of connected wallet",
  input: z.object({
    address: z.string().optional()
  }),
  execute: async ({ address }): Promise<{ balance: string; formatted: string }> => {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error("Wallet not connected");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const balance = await provider.getBalance(address || (await provider.getSigner()).address);
    
    return {
      balance: balance.toString(),
      formatted: ethers.formatEther(balance)
    };
  }
});

