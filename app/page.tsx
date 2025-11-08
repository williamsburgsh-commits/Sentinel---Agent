import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Hero Heading */}
        <div className="space-y-4">
          <h1 className="text-6xl md:text-7xl font-bold text-white tracking-tight">
            Sentinel
          </h1>
          <div className="h-1 w-24 bg-blue-500 mx-auto rounded-full"></div>
        </div>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Autonomous on-chain monitors powered by micropayments.
          <span className="block mt-2 text-gray-400 text-lg">
            Set price alerts, monitor Solana blockchain activity, and receive instant notifications—all running autonomously on-chain.
          </span>
        </p>

        {/* CTA Button */}
        <div className="pt-4">
          <Link href="/dashboard">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all"
            >
              Launch Dashboard
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 text-gray-400">
          <div className="space-y-2">
            <div className="text-3xl">⚡</div>
            <h3 className="text-white font-semibold">Real-time Monitoring</h3>
            <p className="text-sm">Track SOL prices with Switchboard oracles</p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl">🔔</div>
            <h3 className="text-white font-semibold">Instant Alerts</h3>
            <p className="text-sm">Discord notifications when thresholds are met</p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl">💎</div>
            <h3 className="text-white font-semibold">Micropayments</h3>
            <p className="text-sm">Pay only for checks you run on Solana</p>
          </div>
        </div>
      </div>
    </div>
  );
}
