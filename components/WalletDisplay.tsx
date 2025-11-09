'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Connection, PublicKey, LAMPORTS_PER_SOL, clusterApiUrl } from '@solana/web3.js';
import { toast } from 'sonner';

interface WalletDisplayProps {
  walletAddress: string;
}

export default function WalletDisplay({ walletAddress }: WalletDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [isAirdropping, setIsAirdropping] = useState(false);
  const [airdropSuccess, setAirdropSuccess] = useState(false);
  const [airdropError, setAirdropError] = useState<string | null>(null);

  const fetchBalance = async () => {
    try {
      setIsLoadingBalance(true);
      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
      const publicKey = new PublicKey(walletAddress);
      const balanceInLamports = await connection.getBalance(publicKey);
      setBalance(balanceInLamports / LAMPORTS_PER_SOL);
    } catch (err) {
      console.error('Failed to fetch balance:', err);
      toast.error('Failed to Fetch Balance', {
        description: 'Unable to connect to Solana devnet. Please try again later.',
      });
      setBalance(0);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  // Fetch balance on mount and after airdrop
  useEffect(() => {
    fetchBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Copied!', {
        description: 'Wallet address copied to clipboard.',
      });
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Copy Failed', {
        description: 'Unable to copy to clipboard. Please copy manually.',
      });
    }
  };

  const handleAirdrop = async () => {
    setIsAirdropping(true);
    setAirdropError(null);
    setAirdropSuccess(false);

    try {
      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
      const publicKey = new PublicKey(walletAddress);
      
      // Request 1 SOL airdrop
      const signature = await connection.requestAirdrop(
        publicKey,
        1 * LAMPORTS_PER_SOL
      );

      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');

      // Update balance
      await fetchBalance();
      
      setAirdropSuccess(true);
      setTimeout(() => setAirdropSuccess(false), 5000);
      
      toast.success('Airdrop Successful!', {
        description: '1 SOL has been added to your wallet.',
      });
    } catch (err) {
      console.error('Airdrop failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Airdrop failed. Please try again.';
      setAirdropError(errorMessage);
      
      // Check for rate limit error (429)
      if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('rate limit')) {
        toast.error('Airdrop Rate Limit Reached', {
          description: 'You have reached the daily airdrop limit. Try alternative faucets.',
          duration: 6000,
        });
      } else if (errorMessage.toLowerCase().includes('dry')) {
        toast.error('Faucet Dry', {
          description: 'The devnet faucet is currently out of funds. Try alternative faucets.',
          duration: 6000,
        });
      } else {
        toast.error('Airdrop Failed', {
          description: errorMessage || 'Unable to request airdrop. Please try again.',
        });
      }
    } finally {
      setIsAirdropping(false);
    }
  };

  const solscanUrl = `https://solscan.io/account/${walletAddress}?cluster=devnet`;

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Sentinel Wallet</CardTitle>
        <CardDescription className="text-gray-400">
          Your autonomous agent&apos;s Solana wallet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Balance Display */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-700/50">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-gray-300 text-sm">Wallet Balance</Label>
              <p className="text-white text-2xl font-bold mt-1">
                {isLoadingBalance ? (
                  <span className="text-gray-400">Loading...</span>
                ) : (
                  <>{balance?.toFixed(4) || '0.0000'} SOL</>
                )}
              </p>
            </div>
            <Button
              onClick={handleAirdrop}
              disabled={isAirdropping}
              className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAirdropping ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Requesting...
                </>
              ) : (
                'Request Airdrop'
              )}
            </Button>
          </div>
        </div>

        {/* Success Message */}
        {airdropSuccess && (
          <div className="p-3 rounded-md bg-green-900/50 border border-green-700">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-green-400"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <p className="text-green-200 text-sm font-medium">
                Successfully airdropped 1 SOL to your wallet!
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {airdropError && (
          <div className="p-3 rounded-md bg-red-900/50 border border-red-700">
            <p className="text-red-200 text-sm">{airdropError}</p>
          </div>
        )}

        {/* Wallet Address Section */}
        <div className="space-y-2">
          <Label className="text-gray-200">Wallet Address</Label>
          <div className="flex gap-2">
            <div className="flex-1 p-3 rounded-md bg-gray-700 border border-gray-600">
              <p className="text-white font-mono text-sm break-all">
                {walletAddress}
              </p>
            </div>
            <Button
              onClick={handleCopy}
              variant="outline"
              className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 hover:text-white shrink-0"
            >
              {copied ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-green-400"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
              )}
            </Button>
          </div>
        </div>

        {/* QR Code Placeholder */}
        <div className="space-y-2">
          <Label className="text-gray-200">Funding Instructions</Label>
          <div className="p-8 rounded-lg bg-gradient-to-br from-gray-700 to-gray-800 border-2 border-dashed border-gray-600 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-32 h-32 bg-gray-900 rounded-lg flex items-center justify-center border border-gray-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-500"
              >
                <rect width="5" height="5" x="3" y="3" rx="1" />
                <rect width="5" height="5" x="16" y="3" rx="1" />
                <rect width="5" height="5" x="3" y="16" rx="1" />
                <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
                <path d="M21 21v.01" />
                <path d="M12 7v3a2 2 0 0 1-2 2H7" />
                <path d="M3 12h.01" />
                <path d="M12 3h.01" />
                <path d="M12 16v.01" />
                <path d="M16 12h1" />
                <path d="M21 12v.01" />
                <path d="M12 21v-1" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-lg">Fund this wallet with devnet SOL</p>
              <p className="text-gray-400 text-sm mt-1">
                QR code will be generated here
              </p>
            </div>
          </div>
        </div>

        {/* Solscan Link */}
        <div className="pt-4 border-t border-gray-700">
          <a
            href={solscanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full p-3 rounded-md bg-purple-600 hover:bg-purple-700 transition-colors text-white font-medium"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" x2="21" y1="14" y2="3" />
            </svg>
            View on Solscan (Devnet)
          </a>
        </div>

        {/* Info Box */}
        <div className="p-4 rounded-md bg-blue-900/30 border border-blue-700/50">
          <div className="flex gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-blue-400 shrink-0 mt-0.5"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
            <div className="text-sm">
              <p className="text-blue-200 font-medium">Important</p>
              <p className="text-blue-300 mt-1">
                This wallet needs SOL to pay for transaction fees when checking prices and sending alerts.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
