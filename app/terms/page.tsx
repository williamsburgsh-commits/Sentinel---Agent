export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        
        <div className="space-y-6 text-gray-300">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Sentinel Agent, you accept and agree to be bound by the terms 
              and provision of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Use of Service</h2>
            <p>
              Sentinel Agent is a price monitoring and alert service for Solana-based assets. 
              You are responsible for maintaining the security of your account and wallet.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Financial Disclaimer</h2>
            <p className="mb-2">
              <strong>Important:</strong> This service involves cryptocurrency transactions.
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>You are responsible for all transactions made through your account</li>
              <li>Cryptocurrency transactions are irreversible</li>
              <li>Network fees (gas fees) apply to all blockchain transactions</li>
              <li>We are not responsible for price fluctuations or market volatility</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Privacy</h2>
            <p>
              We collect minimal data necessary to provide the service. Your wallet private keys 
              are encrypted and stored securely. We never share your personal information with 
              third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Limitation of Liability</h2>
            <p>
              Sentinel Agent is provided "as is" without warranties of any kind. We are not liable 
              for any losses incurred through the use of this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of the service 
              constitutes acceptance of modified terms.
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-gray-700">
            <p className="text-sm text-gray-400">
              Last updated: November 2025
            </p>
          </div>
        </div>

        <div className="mt-8">
          <a 
            href="/" 
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
