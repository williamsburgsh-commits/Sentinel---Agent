'use client';

/**
 * OnchainKit Provider Component
 * 
 * Wraps the application with Coinbase OnchainKit context providers
 * to enable embedded wallet functionality throughout the app.
 * 
 * Note: While OnchainKit is primarily designed for EVM chains,
 * this provider prepares the app for CDP Embedded Wallet integration.
 * The app currently uses Solana, but CDP services can be leveraged
 * through the server-side CDP client for wallet management.
 */

import { OnchainKitProvider as BaseOnchainKitProvider } from '@coinbase/onchainkit';
import { base } from 'viem/chains';
import { ReactNode, useEffect } from 'react';

interface OnchainKitProviderProps {
  children: ReactNode;
}

export function OnchainKitProvider({ children }: OnchainKitProviderProps) {
  // Get API key from environment (public key for client-side usage)
  const apiKey = process.env.NEXT_PUBLIC_CDP_API_KEY;
  
  // Log configuration status on mount
  useEffect(() => {
    if (!apiKey) {
      console.warn('⚠️ NEXT_PUBLIC_CDP_API_KEY not configured.');
      console.warn('   OnchainKit UI components will be limited.');
      console.warn('   Server-side CDP wallet creation will still work with CDP_API_KEY.');
    } else {
      console.log('✅ OnchainKit provider initialized with API key');
    }
  }, [apiKey]);
  
  return (
    <BaseOnchainKitProvider
      apiKey={apiKey || ''}
      chain={base}
      config={{
        appearance: {
          mode: 'dark',
          theme: 'default',
        },
      }}
    >
      {children}
    </BaseOnchainKitProvider>
  );
}
