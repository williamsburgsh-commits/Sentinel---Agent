import { AggregatorAccount, SwitchboardProgram } from '@switchboard-xyz/solana.js';
import { PublicKey } from '@solana/web3.js';
import { connection } from './solana';

// Switchboard SOL/USD price feed address on devnet
const SOL_USD_FEED = new PublicKey('GvDMxPzN1sCj7L26YDK2HnMRXEQmQ2aemov8YBtPS7vR');

/**
 * Get the current SOL/USD price from Switchboard
 * @returns The current SOL price in USD
 */
export async function getSOLPrice(): Promise<number> {
  try {
    // Initialize Switchboard program
    const program = await SwitchboardProgram.load(connection);
    
    // Load the aggregator account
    const aggregatorAccount = new AggregatorAccount(program, SOL_USD_FEED);
    
    // Fetch the latest value
    const result = await aggregatorAccount.fetchLatestValue();
    
    if (result) {
      return result.toNumber();
    }
    
    // Fallback to simulated price if result is null
    return getSimulatedPrice();
  } catch (error) {
    console.warn('Failed to fetch SOL price from Switchboard, using simulated price:', error);
    return getSimulatedPrice();
  }
}

/**
 * Generate a simulated SOL price for demo purposes
 * @returns A random price between 140 and 160
 */
function getSimulatedPrice(): number {
  return Math.random() * (160 - 140) + 140;
}
