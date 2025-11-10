'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface BalanceCardProps {
  walletAddress: string;
  solBalance: number | null;
  usdcBalance: number | null;
  cashBalance: number | null;
  paymentMethod: 'usdc' | 'cash';
}

const PAYMENT_AMOUNT = 0.0001; // Cost per check (same for USDC and CASH)
const LOW_BALANCE_THRESHOLD = 0.01; // Warning threshold

export default function BalanceCard({ 
  walletAddress, 
  solBalance, 
  usdcBalance, 
  cashBalance,
  paymentMethod 
}: BalanceCardProps) {
  // Get the appropriate balance based on payment method
  const paymentBalance = paymentMethod === 'cash' ? cashBalance : usdcBalance;
  const tokenName = paymentMethod === 'cash' ? 'CASH' : 'USDC';
  
  // Calculate estimated remaining checks
  const estimatedChecks = paymentBalance !== null && paymentBalance > 0
    ? Math.floor(paymentBalance / PAYMENT_AMOUNT)
    : 0;

  const isLowPaymentBalance = paymentBalance !== null && paymentBalance < LOW_BALANCE_THRESHOLD;
  const isLowSOL = solBalance !== null && solBalance < 0.1;

  const handleRequestPaymentToken = () => {
    if (paymentMethod === 'cash') {
      // CASH is mainnet-only, show instructions
      alert(
        '💡 Phantom CASH Instructions:\n\n' +
        '1. CASH is only available on Solana mainnet\n' +
        '2. Open your Phantom wallet\n' +
        '3. Purchase CASH using the in-app swap feature\n' +
        '4. Or deposit USDC and convert to CASH\n\n' +
        'Note: This demo uses simulated CASH balance for testing.'
      );
    } else {
      // Open USDC devnet faucet
      window.open('https://spl-token-faucet.com/?token-name=USDC', '_blank', 'noopener,noreferrer');
    }
  };

  const handleRequestSOL = () => {
    // Open Solana devnet faucet
    window.open('https://faucet.solana.com/', '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
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
            className="text-purple-400"
          >
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <line x1="2" x2="22" y1="10" y2="10" />
          </svg>
          Wallet Balances
        </CardTitle>
        <CardDescription className="text-gray-400">
          Monitor your SOL and {tokenName} balances
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Payment Token Balance - Primary (USDC or CASH based on selection) */}
        <div className={`p-4 rounded-lg bg-gradient-to-br border ${
          paymentMethod === 'cash' 
            ? 'from-green-900/40 to-green-800/40 border-green-700/50' 
            : 'from-blue-900/40 to-blue-800/40 border-blue-700/50'
        }`}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                paymentMethod === 'cash' ? 'bg-green-600/30' : 'bg-blue-600/30'
              }`}>
                {paymentMethod === 'cash' ? (
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
                    className="text-green-300"
                  >
                    <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
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
                    className="text-blue-300"
                  >
                    <line x1="12" x2="12" y1="2" y2="22" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                )}
              </div>
              <div>
                <p className={`text-xs font-medium uppercase tracking-wide ${
                  paymentMethod === 'cash' ? 'text-green-200' : 'text-blue-200'
                }`}>
                  {tokenName} Balance {paymentMethod === 'cash' && '⚡'}
                </p>
                <p className="text-gray-400 text-xs">For price check payments</p>
              </div>
            </div>
            {isLowPaymentBalance && (
              <Badge variant="destructive" className="bg-orange-600 text-xs">
                Low
              </Badge>
            )}
          </div>
          
          <div className="space-y-3">
            <div className="flex items-baseline gap-2">
              {paymentBalance !== null ? (
                <>
                  <p className="text-white text-3xl font-bold">
                    {paymentBalance.toFixed(4)}
                  </p>
                  <p className={`text-lg font-semibold ${
                    paymentMethod === 'cash' ? 'text-green-300' : 'text-blue-300'
                  }`}>
                    {tokenName}
                  </p>
                  {paymentMethod === 'cash' && (
                    <Badge className="bg-blue-600 text-xs">DEMO</Badge>
                  )}
                </>
              ) : (
                <p className="text-gray-400 text-lg">Loading...</p>
              )}
            </div>

            {/* Estimated Checks */}
            {paymentBalance !== null && (
              <div className="flex items-center gap-2 text-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={paymentMethod === 'cash' ? 'text-green-400' : 'text-blue-400'}
                >
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
                <span className={paymentMethod === 'cash' ? 'text-green-200' : 'text-blue-200'}>
                  ~{estimatedChecks.toLocaleString()} checks remaining
                </span>
                <span className={`text-xs ${paymentMethod === 'cash' ? 'text-green-400' : 'text-blue-400'}`}>
                  ({PAYMENT_AMOUNT} {tokenName} each)
                </span>
              </div>
            )}

            {/* Request Token Button */}
            <Button
              onClick={handleRequestPaymentToken}
              variant="outline"
              size="sm"
              className={`w-full border ${
                paymentMethod === 'cash'
                  ? 'bg-green-600/20 border-green-500 text-green-200 hover:bg-green-600/30 hover:text-green-100'
                  : 'bg-blue-600/20 border-blue-500 text-blue-200 hover:bg-blue-600/30 hover:text-blue-100'
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" x2="12" y1="15" y2="3" />
              </svg>
              {paymentMethod === 'cash' ? 'Get CASH Instructions' : 'Request Devnet USDC'}
            </Button>

            {/* Low Balance Warning */}
            {isLowPaymentBalance && (
              <div className="p-2 rounded bg-orange-900/30 border border-orange-700/50">
                <p className="text-orange-200 text-xs">
                  ⚠️ Low {tokenName} balance. {paymentMethod === 'cash' ? 'Get CASH to continue.' : 'Request more to continue monitoring.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* SOL Balance - Secondary */}
        <div className="p-4 rounded-lg bg-gradient-to-br from-purple-900/40 to-purple-800/40 border border-purple-700/50">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-purple-600/30 flex items-center justify-center">
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
                  className="text-purple-300"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                  <path d="M12 18V6" />
                </svg>
              </div>
              <div>
                <p className="text-purple-200 text-xs font-medium uppercase tracking-wide">SOL Balance</p>
                <p className="text-gray-400 text-xs">For transaction fees</p>
              </div>
            </div>
            {isLowSOL && (
              <Badge variant="destructive" className="bg-yellow-600 text-xs">
                Low
              </Badge>
            )}
          </div>
          
          <div className="space-y-3">
            <div className="flex items-baseline gap-2">
              {solBalance !== null ? (
                <>
                  <p className="text-white text-2xl font-bold">
                    {solBalance.toFixed(4)}
                  </p>
                  <p className="text-purple-300 text-lg font-semibold">SOL</p>
                </>
              ) : (
                <p className="text-gray-400 text-lg">Loading...</p>
              )}
            </div>

            {/* Request SOL Button */}
            <Button
              onClick={handleRequestSOL}
              variant="outline"
              size="sm"
              className="w-full bg-purple-600/20 border-purple-500 text-purple-200 hover:bg-purple-600/30 hover:text-purple-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" x2="12" y1="15" y2="3" />
              </svg>
              Request Devnet SOL
            </Button>

            {/* Low Balance Warning */}
            {isLowSOL && (
              <div className="p-2 rounded bg-yellow-900/30 border border-yellow-700/50">
                <p className="text-yellow-200 text-xs">
                  ⚠️ Low SOL balance. Needed for transaction fees.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Wallet Address Info */}
        <div className="p-3 rounded-lg bg-gray-700/30 border border-gray-600">
          <div className="flex items-center gap-2 mb-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-400"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <line x1="2" x2="22" y1="10" y2="10" />
            </svg>
            <p className="text-gray-400 text-xs font-medium">Wallet Address</p>
          </div>
          <p className="text-gray-300 text-xs font-mono break-all">
            {walletAddress}
          </p>
        </div>

        {/* Instructions */}
        <div className="p-3 rounded-lg bg-blue-900/20 border border-blue-700/30">
          <p className="text-blue-200 text-xs leading-relaxed">
            <strong>💡 Tip:</strong> Use the faucet buttons to get free devnet tokens. 
            You&apos;ll need USDC for price checks and SOL for transaction fees.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
