import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import { SentinelConfig, SentinelActivity } from '../types';
import { getSOLPrice } from './switchboard';
import { sendDiscordAlert } from './notifications';
import { sendUSDCPayment, checkUSDCBalance, sendCASHPayment, getCASHBalance } from './payments';
import { getOraclePublicKey } from './treasury';

/**
 * Payment amount per price check (same for USDC and CASH)
 * This is charged by the oracle for providing price data
 */
const PRICE_CHECK_COST = 0.0001; // 0.0001 USDC/CASH per check

/**
 * Run a price check for a Sentinel configuration
 * 
 * Flow:
 * 1. Verify Sentinel has sufficient payment token balance (USDC or CASH)
 * 2. Send payment to oracle treasury (HTTP 402 micropayment)
 * 3. Fetch price data from oracle
 * 4. Check if threshold condition is met
 * 5. Send Discord alert if triggered
 * 6. Return activity log with transaction signature and settlement time
 * 
 * @param config - The Sentinel configuration to check
 * @returns Activity log entry with check results
 * @throws Error if payment fails or insufficient balance
 */
export async function runSentinelCheck(config: SentinelConfig): Promise<SentinelActivity> {
  const timestamp = new Date();
  let transactionSignature: string | undefined;
  let settlementTimeMs: number | undefined;

  try {
    // Step 1: Reconstruct Sentinel's keypair from private key
    console.log('🔐 Loading Sentinel wallet...');
    const sentinelKeypair = Keypair.fromSecretKey(bs58.decode(config.privateKey));
    console.log('✅ Sentinel wallet loaded:', sentinelKeypair.publicKey.toBase58());

    // Determine payment method (default to USDC for backward compatibility)
    const paymentMethod = config.paymentMethod || 'usdc';
    const tokenName = paymentMethod === 'cash' ? 'CASH' : 'USDC';

    // Step 2: Check payment token balance before attempting payment
    console.log(`💰 Checking ${tokenName} balance...`);
    let tokenBalance: number;
    
    if (paymentMethod === 'cash') {
      tokenBalance = await getCASHBalance(sentinelKeypair.publicKey);
    } else {
      tokenBalance = await checkUSDCBalance(sentinelKeypair.publicKey);
    }
    
    console.log(`📊 Current ${tokenName} balance: ${tokenBalance} ${tokenName}`);

    if (tokenBalance < PRICE_CHECK_COST) {
      const errorMessage = `Insufficient ${tokenName} balance. Required: ${PRICE_CHECK_COST} ${tokenName}, Available: ${tokenBalance} ${tokenName}. Please fund your Sentinel wallet with ${paymentMethod === 'cash' ? 'CASH (mainnet only)' : 'devnet USDC'}.`;
      console.error('❌', errorMessage);
      
      // Return failed activity without attempting payment
      return {
        timestamp,
        price: 0, // No price data fetched
        cost: PRICE_CHECK_COST,
        triggered: false,
        status: 'failed',
        errorMessage,
        paymentMethod,
      };
    }

    // Step 3: Send payment to oracle treasury (HTTP 402 micropayment model)
    console.log(`💳 Sending ${tokenName} payment to oracle...`);
    const oracleAddress = getOraclePublicKey();
    const paymentStartTime = Date.now();
    
    if (paymentMethod === 'cash') {
      transactionSignature = await sendCASHPayment(
        sentinelKeypair,
        oracleAddress,
        PRICE_CHECK_COST
      );
    } else {
      transactionSignature = await sendUSDCPayment(
        sentinelKeypair,
        oracleAddress,
        PRICE_CHECK_COST
      );
    }
    
    settlementTimeMs = Date.now() - paymentStartTime;
    console.log(`✅ Payment successful! Transaction: ${transactionSignature}`);
    console.log(`⚡ Settlement time: ${settlementTimeMs}ms`);

    // Step 4: Fetch price data from oracle (payment verified, data provided)
    console.log('📊 Fetching price data from oracle...');
    const currentPrice = await getSOLPrice();
    console.log(`💵 Current SOL price: $${currentPrice}`);

    // Step 5: Determine if the condition is met
    let triggered = false;
    if (config.condition === 'above' && currentPrice > config.threshold) {
      triggered = true;
      console.log(`🚨 Alert triggered! Price $${currentPrice} is above threshold $${config.threshold}`);
    } else if (config.condition === 'below' && currentPrice < config.threshold) {
      triggered = true;
      console.log(`🚨 Alert triggered! Price $${currentPrice} is below threshold $${config.threshold}`);
    } else {
      console.log(`✅ No alert. Price $${currentPrice} is within threshold.`);
    }

    // Step 6: Send Discord alert if triggered and config is active
    if (triggered && config.isActive) {
      try {
        const alertTitle = config.condition === 'above'
          ? 'Price Above Threshold Alert'
          : 'Price Below Threshold Alert';

        console.log('📢 Sending Discord alert...');
        await sendDiscordAlert(
          config.discordWebhook,
          alertTitle,
          currentPrice,
          config.threshold,
          timestamp
        );
        console.log('✅ Discord alert sent successfully');
      } catch (error) {
        console.error('❌ Failed to send Discord alert:', error);
        // Continue execution even if alert fails
      }
    }

    // Step 7: Return activity log with transaction signature and settlement time
    return {
      timestamp,
      price: currentPrice,
      cost: PRICE_CHECK_COST,
      triggered,
      transactionSignature,
      status: 'success',
      paymentMethod: config.paymentMethod || 'usdc',
      settlementTimeMs,
    };
  } catch (error) {
    console.error('❌ Sentinel check failed:', error);

    // Provide detailed error messages
    if (error instanceof Error) {
      if (error.message.includes('Insufficient')) {
        const paymentMethod = config.paymentMethod || 'usdc';
        
        if (paymentMethod === 'cash') {
          throw new Error(
            `Payment failed: ${error.message}\n\n` +
            `To get CASH:\n` +
            `1. CASH is only available on Solana mainnet\n` +
            `2. Open your Phantom wallet\n` +
            `3. Purchase CASH using the in-app swap feature\n` +
            `Note: This demo uses simulated CASH payments`
          );
        } else {
          throw new Error(
            `Payment failed: ${error.message}\n\n` +
            `To get devnet USDC:\n` +
            `1. Visit https://spl-token-faucet.com/?token-name=USDC\n` +
            `2. Enter your Sentinel wallet address: ${config.walletAddress}\n` +
            `3. Request devnet USDC tokens`
          );
        }
      } else if (error.message.includes('Payment failed')) {
        throw new Error(
          `Unable to send payment to oracle: ${error.message}\n` +
          `The price check was not performed because payment could not be processed.`
        );
      } else if (error.message.includes('Network')) {
        throw new Error(
          `Network error: ${error.message}\n` +
          `Please check your internet connection and Solana devnet status.`
        );
      } else {
        throw new Error(`Sentinel check failed: ${error.message}`);
      }
    }

    throw new Error('Sentinel check failed: Unknown error occurred');
  }
}
