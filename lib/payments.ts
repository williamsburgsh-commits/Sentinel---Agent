import {
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createTransferInstruction,
  getOrCreateAssociatedTokenAccount,
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

    // Get recent blockhash with a longer lastValidBlockHeight
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = senderKeypair.publicKey;
    transaction.lastValidBlockHeight = lastValidBlockHeight;

    console.log('📡 Sending transaction to network...');
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [senderKeypair], // Signers
      {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
        commitment: 'confirmed',
        maxRetries: 5,
        minContextSlot: 0,
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
 * This function handles the complete flow of transferring CASH tokens:
 * 1. Creates or gets associated token accounts for sender and recipient
 * 2. Builds a transfer instruction
 * 3. Sends the transaction to the network
 * 4. Waits for confirmation
 * 5. Returns the transaction signature
 * 
 * CASH is Phantom's USD-pegged stablecoin with instant settlement and lower fees.
 * Note: CASH is only available on mainnet, not on devnet.
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
    // Get current network info for logging
    const network = isMainnet() ? 'MAINNET' : 'DEVNET';
    
    // Validate payment amount against network limits
    const validation = validatePaymentAmount(amountCASH);
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

    console.log(`⚡ ========== CASH PAYMENT (${network}) ==========`);
    console.log('🌐 Network:', network);
    console.log('📤 From:', senderKeypair.publicKey.toBase58());
    console.log('📥 To:', recipientPublicKey.toBase58());
    console.log('💰 Amount:', amountCASH, 'CASH');

    // Convert CASH amount to base units (6 decimals, same as USDC)
    const amountInBaseUnits = Math.floor(amountCASH * Math.pow(10, TOKEN_DECIMALS));
    console.log('🔢 Amount in base units:', amountInBaseUnits);

    if (amountInBaseUnits <= 0) {
      throw new Error('Payment amount must be greater than 0');
    }

    // Get CASH mint address for current network
    const cashMint = getMintAddress('cash');
    console.log('🪙 CASH Mint Address:', cashMint.toBase58());

    // Step 1: Get or create associated token account for sender
    console.log('🔍 Getting sender CASH token account...');
    
    // First, try to find existing token accounts
    const tokenAccounts = await connection.getTokenAccountsByOwner(senderKeypair.publicKey, {
      mint: cashMint
    });
    
    let senderTokenAccount;
    
    if (tokenAccounts.value.length > 0) {
      console.log(`✅ Found existing CASH token account`);
      const accountInfo = await connection.getTokenAccountBalance(tokenAccounts.value[0].pubkey);
      console.log(`   - Balance: ${accountInfo.value.uiAmount} CASH`);
      console.log(`   - Account: ${tokenAccounts.value[0].pubkey.toBase58()}`);
      
      // Use the existing token account
      senderTokenAccount = {
        address: tokenAccounts.value[0].pubkey,
        mint: cashMint,
        owner: senderKeypair.publicKey,
        amount: BigInt(accountInfo.value.amount),
        isInitialized: true,
        isFrozen: false
      };
    } else {
      console.log('ℹ️ No existing CASH token account found, attempting to create one...');
      try {
        senderTokenAccount = await getOrCreateAssociatedTokenAccount(
          connection,
          senderKeypair, // Payer for account creation if needed
          cashMint,
          senderKeypair.publicKey, // Owner of the token account
          false, // Don't allow owner off curve
          'confirmed',
          { commitment: 'confirmed' },
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        );
        console.log('✅ Created new CASH token account:', senderTokenAccount.address.toBase58());
      } catch (createError) {
        console.error('❌ Failed to create CASH token account:', createError);
        throw new Error(`Failed to create CASH token account: ${createError instanceof Error ? createError.message : 'Unknown error'}`);
      }
    }

    // Step 2: Get or create associated token account for recipient
    console.log('🔍 Getting recipient CASH token account...');
    const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      senderKeypair, // Sender pays for recipient's account creation if needed
      cashMint,
      recipientPublicKey // Owner of the token account
    );
    console.log('✅ Recipient CASH token account:', recipientTokenAccount.address.toBase58());

    // Step 3: Check sender's CASH balance
    const senderBalance = Number(senderTokenAccount.amount);
    console.log('💵 Sender CASH balance:', senderBalance / Math.pow(10, TOKEN_DECIMALS), 'CASH');

    if (senderBalance < amountInBaseUnits) {
      throw new Error(
        `Insufficient CASH balance. Required: ${amountCASH} CASH, Available: ${
          senderBalance / Math.pow(10, TOKEN_DECIMALS)
        } CASH`
      );
    }

    // Step 4: Create transfer instruction
    console.log('📝 Creating CASH transfer instruction...');
    const transferInstruction = createTransferInstruction(
      senderTokenAccount.address, // Source token account
      recipientTokenAccount.address, // Destination token account
      senderKeypair.publicKey, // Owner of source account (signer)
      amountInBaseUnits, // Amount in base units
      [], // No additional signers
      TOKEN_PROGRAM_ID
    );

    // Step 5: Build and send transaction
    console.log('🚀 Building CASH transaction...');
    const transaction = new Transaction().add(transferInstruction);

    // Get recent blockhash with a longer lastValidBlockHeight
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = senderKeypair.publicKey;
    transaction.lastValidBlockHeight = lastValidBlockHeight;

    console.log('📡 Sending CASH transaction to network...');
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [senderKeypair], // Signers
      {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
        commitment: 'confirmed',
        maxRetries: 5,
        minContextSlot: 0,
      }
    );

    const endTime = Date.now();
    const settlementTime = endTime - startTime;

    console.log('✅ CASH payment successful!');
    console.log('⚡ Settlement time:', settlementTime, 'ms');
    console.log('🔗 Transaction signature:', signature);
    console.log('🌐 View on Solscan:', getExplorerUrl(signature, 'tx'));

    // Log performance metrics
    console.log('📊 Performance Metrics:');
    console.log('   - Settlement time:', settlementTime, 'ms');
    console.log('   - Target time: ~400ms (Solana finality)');
    console.log('   - Status:', settlementTime < 500 ? '✅ Instant' : '⚠️ Slower than expected');

    return signature;
  } catch (error) {
    const endTime = Date.now();
    const elapsedTime = endTime - startTime;

    console.error('❌ CASH payment failed:', error);
    console.error('⏱️ Failed after:', elapsedTime, 'ms');

    // Provide helpful error messages specific to CASH
    if (error instanceof Error) {
      if (error.message.includes('Insufficient')) {
        throw new Error(`CASH payment failed: ${error.message}`);
      } else if (error.message.includes('CASH token not available')) {
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
 * This function queries the CASH token balance for a given wallet address.
 * Note: CASH is only available on mainnet, not on devnet.
 * 
 * @param walletPublicKey - Public key of the wallet
 * @returns CASH balance (in CASH, not base units)
 */
export async function getCASHBalance(walletPublicKey: PublicKey): Promise<number> {
  try {
    const connection = getSolanaConnection();
    const cashMint = getMintAddress('cash');
    
    console.log('🔍 [getCASHBalance] Checking CASH balance for wallet:', walletPublicKey.toBase58());
    console.log('🪙 [getCASHBalance] CASH Mint Address:', cashMint.toBase58());
    // Get RPC endpoint in a type-safe way
    const rpcEndpoint = 'rpcEndpoint' in connection ? connection.rpcEndpoint : 'unknown';
    console.log('🌐 [getCASHBalance] RPC Endpoint:', rpcEndpoint);

    // Get associated token account
    console.log('🔍 [getCASHBalance] Finding token accounts for this wallet...');
    
    // First, try to find existing token accounts
    const tokenAccounts = await connection.getTokenAccountsByOwner(walletPublicKey, {
      mint: cashMint
    });

    let tokenAccount;
    
    if (tokenAccounts.value.length > 0) {
      console.log(`✅ [getCASHBalance] Found ${tokenAccounts.value.length} existing token account(s)`);
      // Use the first token account found
      const accountInfo = await connection.getTokenAccountBalance(tokenAccounts.value[0].pubkey, 'confirmed');
      const balance = Number(accountInfo.value.amount) / Math.pow(10, accountInfo.value.decimals);
      console.log(`💰 [getCASHBalance] Balance from existing account: ${balance} CASH`);
      return balance;
    } else {
      console.log('ℹ️ [getCASHBalance] No token account found, attempting to create one...');
      try {
        // Try to create the token account if it doesn't exist
        tokenAccount = await getOrCreateAssociatedTokenAccount(
          connection,
          Keypair.generate(), // Dummy keypair (not used for reading)
          cashMint,
          walletPublicKey,
          true, // Allow owner off curve (for reading only)
          'confirmed' // Commitment level
        );
        console.log('✅ [getCASHBalance] Created new token account:', tokenAccount.address.toBase58());
      } catch (createError) {
        console.warn('⚠️ [getCASHBalance] Could not create token account (you may need to initialize it with a small amount of SOL first)');
        console.error('Create account error:', createError);
        return 0; // Return 0 if we can't create the account
      }
    }

    console.log('✅ [getCASHBalance] Token account:', tokenAccount.address.toBase58());
    
    // Get token account info to verify it exists and has data
    console.log('🔍 [getCASHBalance] Fetching token account info...');
    const accountInfo = await connection.getAccountInfo(tokenAccount.address, 'confirmed');
    
    if (!accountInfo) {
      console.warn('⚠️ [getCASHBalance] Token account exists but has no account info');
      // Try direct RPC call as fallback
      try {
        console.log('🔄 [getCASHBalance] Trying direct RPC call to get token accounts...');
        const tokenAccounts = await connection.getTokenAccountsByOwner(walletPublicKey, {
          mint: cashMint
        });
        
        console.log(`🔍 [getCASHBalance] Found ${tokenAccounts.value.length} token accounts for this mint`);
        
        if (tokenAccounts.value.length > 0) {
          const account = tokenAccounts.value[0];
          const accountInfo = await connection.getTokenAccountBalance(account.pubkey, 'confirmed');
          const balance = Number(accountInfo.value.amount) / Math.pow(10, accountInfo.value.decimals);
          console.log(`💰 [getCASHBalance] Direct RPC balance: ${balance} CASH`);
          return balance;
        }
      } catch (rpcError) {
        console.error('❌ [getCASHBalance] RPC fallback failed:', rpcError);
      }
      
      return 0;
    }

    const balance = Number(tokenAccount.amount);
    const formattedBalance = balance / Math.pow(10, TOKEN_DECIMALS);
    
    console.log(`💰 [getCASHBalance] CASH Balance: ${formattedBalance} CASH (${balance} base units)`);
    
    // Additional verification
    if (balance === 0) {
      console.log('ℹ️ [getCASHBalance] Balance is zero, checking token account state...');
      console.log('   - Owner:', tokenAccount.owner.toBase58());
      console.log('   - Mint:', tokenAccount.mint.toBase58());
      console.log('   - Amount (raw):', tokenAccount.amount.toString());
      console.log('   - Is Initialized:', tokenAccount.isInitialized);
      console.log('   - Is Frozen:', tokenAccount.isFrozen);
    }
    
    return formattedBalance;
    
  } catch (error) {
    console.error('❌ [getCASHBalance] Failed to get CASH balance:');
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      // More detailed error handling
      if (error.message.includes('failed to get account')) {
        console.warn('⚠️ This typically means the token account does not exist for this wallet.');
      } else if (error.message.includes('invalid account data for instruction')) {
        console.warn('⚠️ The token account data is invalid. This might indicate an incorrect mint address.');
      } else if (error.message.includes('TokenAccountNotFoundError')) {
        console.warn('⚠️ Token account not found. The wallet may not hold any CASH tokens.');
      }
    } else {
      console.error('Unknown error:', error);
    }
    
    return 0;
  }
}

/**
 * Check CASH balance for a wallet (alias for getCASHBalance)
 * 
 * @param walletPublicKey - Public key of the wallet to check
 * @returns CASH balance (in CASH, not base units)
 */
export async function checkCASHBalance(walletPublicKey: PublicKey): Promise<number> {
  return getCASHBalance(walletPublicKey);
}

/**
 * Get SOL balance for a wallet
 * 
 * This function queries the native SOL balance for a given wallet address.
 * SOL is required to pay for transaction fees.
 * 
 * @param walletPublicKey - Public key of the wallet
 * @returns SOL balance (in SOL, not lamports)
 */
export async function getSOLBalance(walletPublicKey: PublicKey): Promise<number> {
  try {
    const connection = getSolanaConnection();
    const balance = await connection.getBalance(walletPublicKey);
    // Convert lamports to SOL (1 SOL = 1,000,000,000 lamports)
    return balance / 1_000_000_000;
  } catch (error) {
    console.error('Failed to get SOL balance:', error);
    return 0;
  }
}

/**
 * Request SOL airdrop from devnet faucet
 * 
 * This function requests SOL from the devnet faucet to fund a wallet.
 * Only works on devnet, not mainnet.
 * 
 * @param walletPublicKey - Public key of the wallet to receive SOL
 * @param amount - Amount of SOL to request (default: 1 SOL)
 * @returns Transaction signature
 * @throws Error if airdrop fails or if on mainnet
 */
export async function requestSOLAirdrop(
  walletPublicKey: PublicKey,
  amount: number = 1
): Promise<string> {
  try {
    // Only allow airdrop on devnet
    if (isMainnet()) {
      throw new Error('Airdrops are only available on devnet. You are currently on mainnet.');
    }

    console.log('🚰 Requesting SOL airdrop from devnet faucet...');
    console.log('📍 Wallet:', walletPublicKey.toBase58());
    console.log('💰 Amount:', amount, 'SOL');

    const connection = getSolanaConnection();
    
    // Request airdrop (amount in lamports)
    const amountLamports = amount * 1_000_000_000;
    const signature = await connection.requestAirdrop(walletPublicKey, amountLamports);
    
    console.log('⏳ Waiting for airdrop confirmation...');
    
    // Wait for confirmation
    await connection.confirmTransaction(signature, 'confirmed');
    
    console.log('✅ Airdrop successful!');
    console.log('🔗 Transaction signature:', signature);
    console.log('🌐 View on Solscan:', getExplorerUrl(signature, 'tx'));
    
    return signature;
  } catch (error) {
    console.error('❌ Airdrop failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('mainnet')) {
        throw error;
      } else if (error.message.includes('rate limit')) {
        throw new Error('Airdrop rate limit exceeded. Please try again in a few minutes.');
      } else {
        throw new Error(`Airdrop failed: ${error.message}`);
      }
    }
    
    throw new Error('Airdrop failed: Unknown error occurred');
  }
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
