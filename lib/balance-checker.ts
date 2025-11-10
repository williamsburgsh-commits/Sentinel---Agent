import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getUSDCBalance, getCASHBalance } from './payments';
import { getRPCEndpoint } from './networks';

export interface WalletBalances {
  sol: number;
  token: number; // USDC or CASH
  isFunded: boolean;
}

const MIN_SOL_BALANCE = 0.01;
const MIN_TOKEN_BALANCE = 0.01;

export async function checkWalletBalances(
  walletAddress: string,
  paymentMethod: 'usdc' | 'cash',
  network: 'devnet' | 'mainnet' = 'devnet'
): Promise<WalletBalances> {
  try {
    const rpcEndpoint = getRPCEndpoint(network);
    const connection = new Connection(rpcEndpoint, 'confirmed');
    const publicKey = new PublicKey(walletAddress);

    // Check SOL balance
    const solBalance = await connection.getBalance(publicKey);
    const solAmount = solBalance / LAMPORTS_PER_SOL;

    // Check token balance (USDC or CASH)
    let tokenAmount = 0;
    if (paymentMethod === 'usdc') {
      tokenAmount = await getUSDCBalance(publicKey);
    } else {
      tokenAmount = await getCASHBalance(publicKey);
    }

    // Determine if wallet is funded
    const isFunded = solAmount >= MIN_SOL_BALANCE && tokenAmount >= MIN_TOKEN_BALANCE;

    console.log(`💰 Balance check for ${walletAddress.slice(0, 8)}...`);
    console.log(`   SOL: ${solAmount.toFixed(4)}`);
    console.log(`   ${paymentMethod.toUpperCase()}: ${tokenAmount.toFixed(4)}`);
    console.log(`   Funded: ${isFunded}`);

    return {
      sol: solAmount,
      token: tokenAmount,
      isFunded,
    };
  } catch (error) {
    console.error('Error checking wallet balances:', error);
    return {
      sol: 0,
      token: 0,
      isFunded: false,
    };
  }
}

export async function requestDevnetAirdrop(
  walletAddress: string,
  network: 'devnet' | 'mainnet' = 'devnet'
): Promise<{ success: boolean; signature?: string; error?: string }> {
  if (network !== 'devnet') {
    return {
      success: false,
      error: 'Airdrops are only available on devnet',
    };
  }

  try {
    const rpcEndpoint = getRPCEndpoint('devnet');
    const connection = new Connection(rpcEndpoint, 'confirmed');
    const publicKey = new PublicKey(walletAddress);

    console.log(`🪂 Requesting airdrop for ${walletAddress.slice(0, 8)}...`);
    
    // Request 1 SOL airdrop
    const signature = await connection.requestAirdrop(
      publicKey,
      1 * LAMPORTS_PER_SOL
    );

    // Wait for confirmation
    await connection.confirmTransaction(signature, 'confirmed');

    console.log(`✅ Airdrop successful: ${signature}`);

    return {
      success: true,
      signature,
    };
  } catch (error) {
    console.error('Error requesting airdrop:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to request airdrop',
    };
  }
}

export function calculateEstimatedChecks(solBalance: number, tokenBalance: number): number {
  const COST_PER_CHECK = 0.0001;
  
  // Limited by whichever runs out first
  const checksFromToken = Math.floor(tokenBalance / COST_PER_CHECK);
  const checksFromSol = Math.floor(solBalance / 0.00001); // Rough estimate for tx fees
  
  return Math.min(checksFromToken, checksFromSol);
}
