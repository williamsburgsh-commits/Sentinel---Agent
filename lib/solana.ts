import { Connection, PublicKey, Keypair, clusterApiUrl } from '@solana/web3.js';
import bs58 from 'bs58';

// Create Solana connection with confirmed commitment level
export const connection = new Connection(
  process.env.NEXT_PUBLIC_SOLANA_RPC || clusterApiUrl('devnet'),
  'confirmed'
);

/**
 * Get the SOL balance for a given public key
 * @param publicKey - The public key to check balance for
 * @returns The balance in SOL (not lamports)
 */
export async function getBalance(publicKey: PublicKey): Promise<number> {
  const balance = await connection.getBalance(publicKey);
  // Convert lamports to SOL (1 SOL = 1,000,000,000 lamports)
  return balance / 1_000_000_000;
}

/**
 * Create a new Sentinel wallet with a generated keypair
 * @returns Object containing the keypair and public key as a string
 */
export function createSentinelWallet(): { keypair: Keypair; publicKey: string } {
  const keypair = Keypair.generate();
  return {
    keypair,
    publicKey: keypair.publicKey.toString(),
  };
}

/**
 * Restore a wallet from a base58 encoded private key
 * @param privateKeyBase58 - The base58 encoded private key string
 * @returns The Keypair restored from the private key
 */
export function getWalletFromPrivateKey(privateKeyBase58: string): Keypair {
  const privateKeyBytes = bs58.decode(privateKeyBase58);
  return Keypair.fromSecretKey(privateKeyBytes);
}
