import { NextRequest, NextResponse } from 'next/server';
import { runSentinelCheck } from '@/lib/sentinel';
import { getSOLPrice } from '@/lib/switchboard';
import { SentinelConfig } from '@/types';
import { analyzePatterns } from '@/lib/ai-analysis';
import { saveAIAnalysis, getActivities, shouldRunAnalysis } from '@/lib/data-store';
import { sendDiscordAlert } from '@/lib/notifications';

export async function GET() {
  try {
    // Get the current SOL price
    const price = await getSOLPrice();

    return NextResponse.json({
      success: true,
      price,
    });
  } catch (error) {
    console.error('Error fetching SOL price:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch SOL price.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const sentinelConfig: SentinelConfig = body;

    // Validate that we have a valid config
    if (!sentinelConfig || !sentinelConfig.id) {
      return NextResponse.json(
        { success: false, error: 'Invalid sentinel configuration.' },
        { status: 400 }
      );
    }

    // Run the sentinel check
    const activity = await runSentinelCheck(sentinelConfig);

    // Autonomous AI Analysis Integration
    // This demonstrates the x402 protocol pattern: AI agent pays DeepSeek for insights
    try {
      // Check if we should run AI analysis (every 3 activities for testing)
      const shouldAnalyze = await shouldRunAnalysis(sentinelConfig.id);
      console.log(`🔍 Should run AI analysis: ${shouldAnalyze}`);
      
      if (shouldAnalyze) {
        console.log('🤖 Running autonomous AI analysis...');
        
        // Fetch last 50 activities for pattern analysis
        const { activities } = await getActivities(sentinelConfig.id, { limit: 50 });
        
        if (activities.length > 0) {
          // Transform activities to the format expected by analyzePatterns
          const priceData = activities.map(act => ({
            price: act.price,
            timestamp: new Date(act.created_at),
          }));
          
          // Call DeepSeek AI for analysis (agent pays for AI insights)
          const analysis = await analyzePatterns(priceData);
          
          // Save analysis to database
          await saveAIAnalysis(sentinelConfig.id, sentinelConfig.userId, analysis);
          
          console.log(`✅ AI analysis completed: ${analysis.analysis_text.substring(0, 100)}...`);
          console.log(`💰 AI cost: $${analysis.cost}`);
          
          // Send special Discord alert for high-confidence predictions
          if (analysis.confidence_score > 70 && (analysis.sentiment === 'bullish' || analysis.sentiment === 'bearish')) {
            const sentimentEmoji = analysis.sentiment === 'bullish' ? '📈' : '📉';
            const alertMessage = `${sentimentEmoji} **AI Alert: DeepSeek detected strong ${analysis.sentiment} momentum with ${analysis.confidence_score}% confidence**\n\n${analysis.analysis_text}`;
            
            await sendDiscordAlert(
              sentinelConfig.discordWebhook,
              'AI Market Analysis Alert',
              activity.price,
              sentinelConfig.threshold,
              new Date(),
              alertMessage
            );
            
            console.log('📢 High-confidence AI alert sent to Discord');
          }
        }
      }
    } catch (aiError) {
      // AI analysis failure should not break the monitoring loop
      console.error('⚠️ AI analysis failed (non-critical):', aiError);
    }

    // Return success response with activity
    return NextResponse.json({
      success: true,
      activity,
    });
  } catch (error) {
    console.error('Error running sentinel check:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to run sentinel check.' },
      { status: 500 }
    );
  }
}
