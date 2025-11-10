import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
  clusterApiUrl,
} from '@solana/web3.js';
import {
  getOrCreateAssociatedTokenAccount,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { getSolanaConnection } from './solana';
import {
  validatePaymentAmount,
  getTokenMint,
  getExplorerUrl,
  isMainnet,
} from './networks';

/**
 * Token decimals (both USDC and CASH use 6 decimals)
 */
export const TOKEN_DECIMALS = 6;

/**
 * Get the correct mint address based on payment method and network
 */
function getMintAddress(paymentMethod: 'usdc' | 'cash'): PublicKey {
  const mintString = getTokenMint(paymentMethod);
  return new PublicKey(mintString);
}

/**
 * HTTP 402 Payment Required - Micropayment Flow
 * 
 * This implements a pay-per-use model for oracle price data:
 * 
 * 1. Sentinel requests price data from oracle
 * 2. Oracle responds with HTTP 402 (Payment Required)
 * 3. Sentinel sends USDC micropayment to oracle's treasury wallet
 * 4. Oracle verifies payment on-chain
 * 5. Oracle provides price data to sentinel
 * 
 * Benefits:
 * - Pay only for what you use
 * - No subscriptions or upfront costs
 * - Transparent on-chain payment verification
 * - Instant settlement via blockchain
 * - Censorship-resistant payment rail
 * 
 * This is similar to the original HTTP 402 vision where web resources
 * could be paid for with micropayments, but using crypto instead of
 * traditional payment systems.
 */

/**
 * Send USDC payment on Solana devnet
 * 
 * This function handles the complete flow of transferring USDC tokens:
 * 1. Creates or gets associated token accounts for sender and recipient
 * 2. Builds a transfer instruction
 * 3. Sends the transaction to the network
 * 4. Waits for confirmation
 * 5. Returns the transaction signature
 * 
 * @param senderKeypair - The keypair of the wallet sending USDC
 * @param recipientPublicKey - The public key of the recipient (oracle treasury)
 * @param amountUSDC - The amount of USDC to send (in USDC, not base units)
 * @returns Transaction signature as a string
 * @throws Error if payment fails at any step
 */
export async function sendUSDCPayment(
  senderKeypair: Keypair,
  recipientPublicKey: PublicKey,
  amountUSDC: number
): Promise<string> {
  try {
    // Get current network info for logging
    const network = isMainnet() ? 'MAINNET' : 'DEVNET';
    
    // Validate payment amount against network limits
    const validation = validatePaymentAmount(amountUSDC);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    
    // Show warning for mainnet
    if (validation.warning) {
      console.warn(validation.warning);
    }
    
    // Mainnet safety check
    if (isMainnet()) {
      console.warn('🚨 MAINNET TRANSACTION - REAL FUNDS WILL BE USED! 🚨');
    }
    
    // Initialize connection using network configuration
    const connection = getSolanaConnection();

    console.log(`💳 ========== USDC PAYMENT (${network}) ==========`);
    console.log('🌐 Network:', network);
    console.log('📤 From:', senderKeypair.publicKey.toBase58());
    console.log('📥 To:', recipientPublicKey.toBase58());
    console.log('💰 Amount:', amountUSDC, 'USDC');

    // Convert USDC amount to base units (6 decimals)
    // Example: 0.0001 USDC = 100 base units
    const amountInBaseUnits = Math.floor(amountUSDC * Math.pow(10, TOKEN_DECIMALS));
    console.log('🔢 Amount in base units:', amountInBaseUnits);

    if (amountInBaseUnits <= 0) {
      throw new Error('Payment amount must be greater than 0');
    }

    // Get USDC mint address for current network
    const usdcMint = getMintAddress('usdc');
    console.log('🪙 USDC Mint Address:', usdcMint.toBase58());
    
    // Step 1: Get or create associated token account for sender
    console.log('🔍 Getting sender token account...');
    const senderTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      senderKeypair, // Payer for account creation if needed
      usdcMint,
      senderKeypair.publicKey // Owner of the token account
    );
    console.log('✅ Sender token account:', senderTokenAccount.address.toBase58());

    // Step 2: Get or create associated token account for recipient
    console.log('🔍 Getting recipient token account...');
    const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      senderKeypair, // Sender pays for recipient's account creation if needed
      usdcMint,
      recipientPublicKey // Owner of the token account
    );
    console.log('✅ Recipient token account:', recipientTokenAccount.address.toBase58());

    // Step 3: Check sender's USDC balance
    const senderBalance = Number(senderTokenAccount.amount);
    console.log('💵 Sender USDC balance:', senderBalance / Math.pow(10, TOKEN_DECIMALS), 'USDC');

    if (senderBalance < amountInBaseUnits) {
      throw new Error(
        `Insufficient USDC balance. Required: ${amountUSDC} USDC, Available: ${
          senderBalance / Math.pow(10, TOKEN_DECIMALS)
        } USDC`
      );
    }

    // Step 4: Create transfer instruction
    console.log('📝 Creating transfer instruction...');
    const transferInstruction = createTransferInstruction(
      senderTokenAccount.address, // Source token account
      recipientTokenAccount.address, // Destination token account
      senderKeypair.publicKey, // Owner of source account (signer)
      amountInBaseUnits, // Amount in base units
      [], // No additional signers
      TOKEN_PROGRAM_ID
    );

    // Step 5: Build and send transaction
    console.log('🚀 Building transaction...');
    const transaction = new Transaction().add(transferInstruction);

    // Get recent blockhash for transaction
    const { blockhash } = await connection.getLatestBlockhash('confirmed');
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = senderKeypair.publicKey;

    console.log('📡 Sending transaction to network...');
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [senderKeypair], // Signers
      {
        commitment: 'confirmed',
        maxRetries: 3,
      }
    );

    console.log('✅ Payment successful!');
    console.log('🔗 Transaction signature:', signature);
    console.log('🌐 View on Solscan:', getExplorerUrl(signature, 'tx'));

    return signature;
  } catch (error) {
    console.error('❌ USDC payment failed:', error);

    // Provide helpful error messages
    if (error instanceof Error) {
      if (error.message.includes('Insufficient')) {
        throw new Error(`Payment failed: ${error.message}`);
      } else if (error.message.includes('AccountNotFound')) {
        throw new Error(
          'Payment failed: Sender does not have a USDC token account. Please fund your wallet with devnet USDC first.'
        );
      } else if (error.message.includes('TokenAccountNotFoundError')) {
        throw new Error(
          'Payment failed: USDC token account not found. Please ensure you have devnet USDC.'
        );
      } else if (error.message.includes('Network')) {
        throw new Error('Payment failed: Network error. Please check your connection and try again.');
      } else {
        throw new Error(`Payment failed: ${error.message}`);
      }
    }

    throw new Error('Payment failed: Unknown error occurred');
  }
}

/**
 * Send Phantom CASH payment on Solana
 * 
 * TODO: Implement with official Phantom CASH SDK when available
 * 
 * This is a PLACEHOLDER function that simulates instant CASH payment for demo purposes.
 * CASH is Phantom's USD-pegged stablecoin with instant settlement and lower fees.
 * 
 * Key differences from USDC:
 * - Near-instant settlement (~400ms on Solana)
 * - Lower transaction fees (~$0.00001)
 * - Native Phantom wallet integration
 * - Likely mainnet-only (no devnet support)
 * 
 * When implementing with real SDK:
 * 1. Import Phantom CASH SDK or use standard SPL token with CASH mint
 * 2. Update CASH_MINT_ADDRESS with official mint address
 * 3. Follow same pattern as sendUSDCPayment but with CASH token
 * 4. Measure settlement time for instant confirmation
 * 5. Handle CASH-specific errors (insufficient balance, mainnet-only, etc.)
 * 
 * @param senderKeypair - The keypair of the wallet sending CASH
 * @param recipientPublicKey - The public key of the recipient (oracle treasury)
 * @param amountCASH - The amount of CASH to send (in CASH, not base units)
 * @returns Transaction signature as a string
 * @throws Error if payment fails at any step
 */
export async function sendCASHPayment(
  senderKeypair: Keypair,
  recipientPublicKey: PublicKey,
  amountCASH: number
): Promise<string> {
  const startTime = Date.now();

  try {
    console.log('⚡ Initiating CASH payment (DEMO MODE)...');
    console.log('📤 From:', senderKeypair.publicKey.toBase58());
    console.log('📥 To:', recipientPublicKey.toBase58());
    console.log('💰 Amount:', amountCASH, 'CASH');

    // TODO: Replace this placeholder with real CASH SDK implementation
    // For now, simulate instant payment for demo purposes

    // Simulate near-instant settlement (400ms as per Phantom CASH specs)
    await new Promise(resolve => setTimeout(resolve, 400));

    // Generate a simulated transaction signature
    // In production, this would be the actual on-chain transaction signature
    const simulatedSignature = `CASH_DEMO_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const endTime = Date.now();
    const settlementTime = endTime - startTime;

    console.log('✅ CASH payment successful (DEMO)!');
    console.log('⚡ Settlement time:', settlementTime, 'ms');
    console.log('🔗 Transaction signature:', simulatedSignature);
    console.log('💡 Note: This is a demo transaction. Implement with real CASH SDK for production.');

    // Log performance metrics
    console.log('📊 Performance Metrics:');
    console.log('   - Settlement time:', settlementTime, 'ms');
    console.log('   - Target time: ~400ms (Solana finality)');
    console.log('   - Status:', settlementTime < 500 ? '✅ Instant' : '⚠️ Slower than expected');

    return simulatedSignature;

    /* 
    // TODO: Uncomment and implement when CASH SDK is available
    
    // Initialize connection to Solana mainnet (CASH likely mainnet-only)
    const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');

    // Convert CASH amount to base units (6 decimals, same as USDC)
    const amountInBaseUnits = Math.floor(amountCASH * Math.pow(10, CASH_DECIMALS));
    console.log('🔢 Amount in base units:', amountInBaseUnits);

    if (amountInBaseUnits <= 0) {
      throw new Error('Payment amount must be greater than 0');
    }

    // Get or create associated token account for sender
    console.log('🔍 Getting sender CASH token account...');
    const senderTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      senderKeypair,
      CASH_MINT_ADDRESS,
      senderKeypair.publicKey
    );
    console.log('✅ Sender CASH token account:', senderTokenAccount.address.toBase58());

    // Get or create associated token account for recipient
    console.log('🔍 Getting recipient CASH token account...');
    const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      senderKeypair,
      CASH_MINT_ADDRESS,
      recipientPublicKey
    );
    console.log('✅ Recipient CASH token account:', recipientTokenAccount.address.toBase58());

    // Check sender's CASH balance
    const senderBalance = Number(senderTokenAccount.amount);
    console.log('💵 Sender CASH balance:', senderBalance / Math.pow(10, CASH_DECIMALS), 'CASH');

    if (senderBalance < amountInBaseUnits) {
      throw new Error(
        `Insufficient CASH balance. Required: ${amountCASH} CASH, Available: ${
          senderBalance / Math.pow(10, CASH_DECIMALS)
        } CASH`
      );
    }

    // Create transfer instruction
    console.log('📝 Creating CASH transfer instruction...');
    const transferInstruction = createTransferInstruction(
      senderTokenAccount.address,
      recipientTokenAccount.address,
      senderKeypair.publicKey,
      amountInBaseUnits,
      [],
      TOKEN_PROGRAM_ID
    );

    // Build and send transaction
    console.log('🚀 Building CASH transaction...');
    const transaction = new Transaction().add(transferInstruction);

    const { blockhash } = await connection.getLatestBlockhash('confirmed');
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = senderKeypair.publicKey;

    console.log('📡 Sending CASH transaction to network...');
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [senderKeypair],
      {
        commitment: 'confirmed',
        maxRetries: 3,
      }
    );

    const endTime = Date.now();
    const settlementTime = endTime - startTime;

    console.log('✅ CASH payment successful!');
    console.log('⚡ Settlement time:', settlementTime, 'ms');
    console.log('🔗 Transaction signature:', signature);
    console.log('🌐 View on Solscan:', `https://solscan.io/tx/${signature}`);

    // Log performance metrics
    console.log('📊 Performance Metrics:');
    console.log('   - Settlement time:', settlementTime, 'ms');
    console.log('   - Target time: ~400ms (Solana finality)');
    console.log('   - Status:', settlementTime < 500 ? '✅ Instant' : '⚠️ Slower than expected');

    return signature;
    */
  } catch (error) {
    const endTime = Date.now();
    const elapsedTime = endTime - startTime;

    console.error('❌ CASH payment failed:', error);
    console.error('⏱️ Failed after:', elapsedTime, 'ms');

    // Provide helpful error messages specific to CASH
    if (error instanceof Error) {
      if (error.message.includes('Insufficient')) {
        throw new Error(`CASH payment failed: ${error.message}`);
      } else if (error.message.includes('mainnet')) {
        throw new Error(
          'CASH payment failed: CASH is only available on mainnet. Please switch to mainnet or use USDC on devnet.'
        );
      } else if (error.message.includes('AccountNotFound')) {
        throw new Error(
          'CASH payment failed: Sender does not have a CASH token account. Please ensure you have CASH in your Phantom wallet.'
        );
      } else if (error.message.includes('TokenAccountNotFoundError')) {
        throw new Error(
          'CASH payment failed: CASH token account not found. Please ensure you have CASH tokens.'
        );
      } else if (error.message.includes('Network')) {
        throw new Error('CASH payment failed: Network error. Please check your connection and try again.');
      } else {
        throw new Error(`CASH payment failed: ${error.message}`);
      }
    }

    throw new Error('CASH payment failed: Unknown error occurred');
  }
}

/**
 * Verify a USDC payment transaction
 * 
 * This function checks if a transaction signature is valid and confirmed
 * Useful for the oracle to verify payment before providing data
 * 
 * @param signature - Transaction signature to verify
 * @returns true if transaction is confirmed, false otherwise
 */
export async function verifyUSDCPayment(signature: string): Promise<boolean> {
  try {
    // Use dynamic connection based on current network
    const connection = getSolanaConnection();
    const network = isMainnet() ? 'MAINNET' : 'DEVNET';

    console.log(`🔍 Verifying payment transaction on ${network}:`, signature);

    const transaction = await connection.getTransaction(signature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0,
    });

    if (!transaction) {
      console.log('❌ Transaction not found on', network);
      return false;
    }

    if (transaction.meta?.err) {
      console.log('❌ Transaction failed:', transaction.meta.err);
      return false;
    }

    console.log(`✅ Payment verified successfully on ${network}`);
    return true;
  } catch (error) {
    console.error('❌ Payment verification failed:', error);
    return false;
  }
}

/**
 * Get USDC balance for a wallet
 * 
 * @param walletPublicKey - Public key of the wallet
 * @returns USDC balance (in USDC, not base units)
 */
export async function getUSDCBalance(walletPublicKey: PublicKey): Promise<number> {
  try {
    const connection = getSolanaConnection();
    const usdcMint = getMintAddress('usdc');

    // Get associated token account
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      Keypair.generate(), // Dummy keypair (not used for reading)
      usdcMint,
      walletPublicKey,
      true // Allow owner off curve (for reading only)
    );

    const balance = Number(tokenAccount.amount);
    return balance / Math.pow(10, TOKEN_DECIMALS);
  } catch (error) {
    console.error('Failed to get USDC balance:', error);
    return 0;
  }
}

/**
 * Check USDC balance for a wallet (alias for getUSDCBalance)
 * 
 * This function checks the USDC token balance for a given wallet address.
 * It's useful for validating sufficient funds before attempting a payment.
 * 
 * @param walletPublicKey - Public key of the wallet to check
 * @returns USDC balance (in USDC, not base units)
 * 
 * @example
 * const balance = await checkUSDCBalance(walletPublicKey);
 * if (balance < 0.0001) {
 *   console.log('Insufficient USDC balance');
 * }
 */
export async function checkUSDCBalance(walletPublicKey: PublicKey): Promise<number> {
  return getUSDCBalance(walletPublicKey);
}

/**
 * Convert USDC amount to base units
 * 
 * @param usdcAmount - Amount in USDC
 * @returns Amount in base units (6 decimals)
 */
export function usdcToBaseUnits(usdcAmount: number): number {
  return Math.floor(usdcAmount * Math.pow(10, TOKEN_DECIMALS));
}

/**
 * Convert base units to USDC amount
 * 
 * @param baseUnits - Amount in base units
 * @returns Amount in USDC
 */
export function baseUnitsToUsdc(baseUnits: number): number {
  return baseUnits / Math.pow(10, TOKEN_DECIMALS);
}

/**
 * Get CASH balance for a wallet
 * 
 * TODO: Implement with real CASH SDK when available
 * 
 * This is a PLACEHOLDER function that returns 0 for demo purposes.
 * In production, this should query the actual CASH token balance.
 * 
 * @param walletPublicKey - Public key of the wallet
 * @returns CASH balance (in CASH, not base units)
 */
export async function getCASHBalance(walletPublicKey: PublicKey): Promise<number> {
  try {
    console.log('💰 Checking CASH balance (DEMO MODE)...');
    console.log('📍 Wallet:', walletPublicKey.toBase58());
    
    // TODO: Replace with real CASH balance check
    // For demo purposes, return 0 (no CASH balance)
    console.log('💡 Note: CASH balance check not implemented. Returning 0 for demo.');
    return 0;

    /*
    // TODO: Uncomment when CASH SDK is available
    const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');

    // Get associated token account
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      Keypair.generate(), // Dummy keypair (not used for reading)
      CASH_MINT_ADDRESS,
      walletPublicKey,
      true // Allow owner off curve (for reading only)
    );

    const balance = Number(tokenAccount.amount);
    const cashBalance = balance / Math.pow(10, CASH_DECIMALS);
    
    console.log('✅ CASH balance:', cashBalance, 'CASH');
    return cashBalance;
    */
  } catch (error) {
    console.error('Failed to get CASH balance:', error);
    return 0;
  }
}

/**
 * Check CASH balance for a wallet (alias for getCASHBalance)
 * 
 * TODO: Implement with real CASH SDK when available
 * 
 * @param walletPublicKey - Public key of the wallet to check
 * @returns CASH balance (in CASH, not base units)
 */
export async function checkCASHBalance(walletPublicKey: PublicKey): Promise<number> {
  return getCASHBalance(walletPublicKey);
}

/**
 * Convert CASH amount to base units
 * 
 * @param cashAmount - Amount in CASH
 * @returns Amount in base units (6 decimals)
 */
export function cashToBaseUnits(cashAmount: number): number {
  return Math.floor(cashAmount * Math.pow(10, TOKEN_DECIMALS));
}

/**
 * Convert base units to CASH amount
 * 
 * @param baseUnits - Amount in base units
 * @returns Amount in CASH
 */
export function baseUnitsToCash(baseUnits: number): number {
  return baseUnits / Math.pow(10, TOKEN_DECIMALS);
}
