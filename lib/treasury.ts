import { Keypair, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';

/**
 * Oracle Treasury Wallet
 * 
 * This is the dedicated Solana wallet that receives micropayments from Sentinels
 * for each price check operation. The oracle provides price data services and
 * charges a small fee (0.0001 SOL per check) to cover operational costs.
 * 
 * IMPORTANT: In production, this private key should be:
 * 1. Stored securely in environment variables
 * 2. Never committed to version control
 * 3. Rotated regularly
 * 4. Protected with proper access controls
 */

// Oracle wallet private key (base58 encoded)
// This is a demo wallet - replace with your own secure wallet in production
const ORACLE_PRIVATE_KEY = 'YOUR_PRIVATE_KEY_HERE_BASE58_ENCODED';

// For demo purposes, generate a new keypair if no private key is set
let oracleKeypair: Keypair;

try {
  if (ORACLE_PRIVATE_KEY === 'YOUR_PRIVATE_KEY_HERE_BASE58_ENCODED') {
    // Generate a new keypair for demo/development
    oracleKeypair = Keypair.generate();
    console.log('⚠️  Generated new oracle wallet for demo purposes');
    console.log('📍 Oracle Address:', oracleKeypair.publicKey.toBase58());
    console.log('🔑 Private Key (save this!):', bs58.encode(oracleKeypair.secretKey));
  } else {
    // Load from private key in production
    const secretKey = bs58.decode(ORACLE_PRIVATE_KEY);
    oracleKeypair = Keypair.fromSecretKey(secretKey);
    console.log('✅ Loaded oracle wallet from private key');
    console.log('📍 Oracle Address:', oracleKeypair.publicKey.toBase58());
  }
} catch (error) {
  console.error('❌ Failed to initialize oracle wallet:', error);
  // Fallback to generated keypair
  oracleKeypair = Keypair.generate();
  console.log('⚠️  Using fallback generated keypair');
}

/**
 * Payment amount per price check operation
 * Set to 0.0001 SOL (100,000 lamports)
 * 
 * Note: USDC would require SPL token transfers. For simplicity, we use SOL.
 * To use USDC, you would need to:
 * 1. Use @solana/spl-token library
 * 2. Set amount in USDC decimals (6 decimals for USDC)
 * 3. Implement token transfer logic
 */
export const PAYMENT_AMOUNT = 0.0001; // SOL per check
export const PAYMENT_AMOUNT_LAMPORTS = 100_000; // 0.0001 SOL in lamports

/**
 * Get the oracle's keypair
 * Use this for signing transactions that require the oracle's authority
 * 
 * @returns The oracle's Solana keypair
 */
export function getOracleWallet(): Keypair {
  return oracleKeypair;
}

/**
 * Get the oracle's public address as a string
 * Use this for displaying the address or as a payment destination
 * 
 * @returns The oracle's public key in base58 format
 */
export function getOracleAddress(): string {
  return oracleKeypair.publicKey.toBase58();
}

/**
 * Get the oracle's public key
 * Use this for transaction instructions that need the PublicKey object
 * 
 * @returns The oracle's PublicKey
 */
export function getOraclePublicKey() {
  // Use the configured payment recipient wallet from environment
  const recipientAddress = process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT_WALLET;
  
  if (!recipientAddress) {
    console.warn('⚠️  NEXT_PUBLIC_PAYMENT_RECIPIENT_WALLET not configured, using generated wallet');
    console.warn('⚠️  Payments will go to:', oracleKeypair.publicKey.toBase58());
    return oracleKeypair.publicKey;
  }
  
  console.log('✅ ========================================');
  console.log('✅ PAYMENT RECIPIENT WALLET CONFIGURED');
  console.log('✅ All payments will go to:', recipientAddress);
  console.log('✅ ========================================');
  return new PublicKey(recipientAddress);
}

/**
 * Verify if a wallet has sufficient balance for a payment
 * 
 * @param balance - Current wallet balance in SOL
 * @returns true if balance is sufficient for payment
 */
export function hasSufficientBalance(balance: number): boolean {
  return balance >= PAYMENT_AMOUNT;
}

/**
 * Calculate total cost for multiple checks
 * 
 * @param numberOfChecks - Number of price checks
 * @returns Total cost in SOL
 */
export function calculateTotalCost(numberOfChecks: number): number {
  return PAYMENT_AMOUNT * numberOfChecks;
}
