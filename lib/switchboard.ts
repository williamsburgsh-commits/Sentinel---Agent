/**
 * Get SOL price (simulated for now)
 * @returns A simulated SOL price in USD
 */
export async function getSOLPrice(): Promise<number> {
  // For now, return a simulated price between 190-210
  return Math.random() * (210 - 190) + 190;
}
