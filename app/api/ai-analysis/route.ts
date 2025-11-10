import { NextResponse } from 'next/server';
import { getSentinels, getActivities, saveAIAnalysis } from '@/lib/data-store';
import { analyzePatterns } from '@/lib/ai-analysis';
import { checkWalletBalances } from '@/lib/balance-checker';
import { sendUSDCPayment } from '@/lib/payments';
import { getOraclePublicKey } from '@/lib/treasury';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

const ANALYSIS_COST = 0.04; // 0.04 USDC per analysis

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('📥 Received request body:', body);
    
    const { sentinel_id, sentinel: sentinelData } = body;

    if (!sentinel_id) {
      console.error('❌ No sentinel_id provided');
      return NextResponse.json(
        { success: false, error: 'Sentinel ID is required' },
        { status: 400 }
      );
    }

    // Use sentinel data from request if provided (client-side storage)
    // Otherwise try to find it in server storage
    let sentinel = sentinelData;
    
    if (!sentinel) {
      console.log('🔍 Looking for sentinel in server storage:', sentinel_id);
      const allSentinels = await getSentinels('dev-test-user-id');
      console.log('📊 Total sentinels found:', allSentinels.length);
      sentinel = allSentinels.find(s => s.id === sentinel_id);
      
      if (!sentinel) {
        console.error('❌ Sentinel not found in server storage');
        return NextResponse.json(
          { 
            success: false, 
            error: 'Sentinel not found. Please pass sentinel data in request or ensure it exists in storage.' 
          },
          { status: 404 }
        );
      }
    }
    
    console.log('✅ Using sentinel:', sentinel.id, sentinel.wallet_address);

    // Check if sentinel has enough balance
    const balances = await checkWalletBalances(
      sentinel.wallet_address,
      sentinel.payment_method,
      sentinel.network
    );

    if (balances.token < ANALYSIS_COST) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Insufficient balance. Need ${ANALYSIS_COST} USDC, have ${balances.token.toFixed(4)} USDC` 
        },
        { status: 400 }
      );
    }

    console.log('💰 Processing AI analysis payment...');
    console.log(`   Cost: ${ANALYSIS_COST} USDC`);
    console.log(`   Wallet: ${sentinel.wallet_address}`);

    // Send payment to oracle
    const oracleAddress = getOraclePublicKey();
    const sentinelKeypair = Keypair.fromSecretKey(bs58.decode(sentinel.private_key));

    let paymentSignature: string;
    try {
      paymentSignature = await sendUSDCPayment(
        sentinelKeypair,
        oracleAddress,
        ANALYSIS_COST
      );
      console.log('✅ Payment successful:', paymentSignature);
    } catch (error) {
      console.error('❌ Payment failed:', error);
      return NextResponse.json(
        { success: false, error: 'Payment failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
        { status: 400 }
      );
    }

    // Fetch activity data for analysis
    // First try from request body, then from server storage
    let activities = body.activities || [];
    
    if (activities.length === 0) {
      console.log('📊 No activities in request, checking server storage...');
      const result = await getActivities(sentinel_id, { limit: 50 });
      activities = result.activities;
    }

    console.log(`📈 Found ${activities.length} activities for analysis`);

    if (activities.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No price data available for analysis. Your sentinel needs to perform at least a few price checks first.' },
        { status: 400 }
      );
    }

    // Transform activities to price data
    const priceData = activities.map((act: { price: number; created_at: string }) => ({
      price: act.price,
      timestamp: new Date(act.created_at),
    }));

    console.log('🤖 Running AI analysis...');
    
    // Run AI analysis
    const analysis = await analyzePatterns(priceData);

    // Save analysis to database
    await saveAIAnalysis(sentinel_id, sentinel.user_id, analysis);

    console.log('✅ AI analysis completed');
    console.log(`   Sentiment: ${analysis.sentiment}`);
    console.log(`   Confidence: ${analysis.confidence_score}%`);

    return NextResponse.json({
      success: true,
      analysis: {
        id: `ai_analysis_${Date.now()}`,
        sentinel_id,
        user_id: sentinel.user_id,
        analysis_text: analysis.analysis_text,
        confidence_score: analysis.confidence_score,
        sentiment: analysis.sentiment,
        cost: ANALYSIS_COST,
        created_at: new Date().toISOString(),
      },
      cost: ANALYSIS_COST,
      payment_signature: paymentSignature,
    });

  } catch (error) {
    console.error('❌ AI analysis error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to run analysis' 
      },
      { status: 500 }
    );
  }
}
