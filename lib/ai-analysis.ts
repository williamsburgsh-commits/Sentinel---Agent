import OpenAI from 'openai';

/**
 * DeepSeek AI Client
 * 
 * This connects to DeepSeek AI for autonomous agent analysis.
 * DeepSeek uses an OpenAI-compatible API, so we use the OpenAI SDK
 * with a custom base URL pointing to DeepSeek's API endpoint.
 * 
 * Get your API key from: https://platform.deepseek.com
 */
let deepseekClient: OpenAI | null = null;

function getDeepSeekClient(): OpenAI | null {
  if (!process.env.DEEPSEEK_API_KEY) {
    console.warn('⚠️ DEEPSEEK_API_KEY not set - AI analysis will be disabled');
    return null;
  }
  
  if (!deepseekClient) {
    deepseekClient = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: process.env.DEEPSEEK_API_KEY,
    });
  }
  
  return deepseekClient;
}

export interface AIAnalysis {
  analysis_text: string;
  confidence_score: number;
  sentiment: string;
  cost: number;
  timestamp: Date;
}

export async function analyzePatterns(
  activities: Array<{ price: number; timestamp: Date }>
): Promise<AIAnalysis> {
  try {
    // Get the DeepSeek client (returns null if API key not set)
    const client = getDeepSeekClient();
    
    if (!client) {
      // Return graceful fallback when API key is not configured
      console.log('⚠️ AI analysis skipped - DEEPSEEK_API_KEY not configured');
      return {
        analysis_text: 'AI analysis not configured - set DEEPSEEK_API_KEY to enable DeepSeek AI insights',
        confidence_score: 0,
        sentiment: 'neutral',
        cost: 0,
        timestamp: new Date(),
      };
    }
    
    // Take only the last 50 activities
    const recentActivities = activities.slice(-50);

    // Format prompt
    let prompt = `You are analyzing SOL/USD price data. Here are the last 50 price checks. Analyze and provide:
1. Volatility assessment
2. Price momentum with percentage
3. Notable patterns
4. Confidence score 0-100
5. Brief prediction

Keep under 100 words. Be specific with numbers.

`;

    // Append each activity
    recentActivities.forEach((activity) => {
      prompt += `${activity.timestamp.toISOString()}: ${activity.price}\n`;
    });

    // Send request to DeepSeek
    const response = await client.chat.completions.create({
      model: 'deepseek-chat',
      max_tokens: 300,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = response.choices[0]?.message?.content || '';

    // Extract confidence score
    const confidenceMatch = content.match(/confidence[:\s]+(\d+)/i);
    const confidence_score = confidenceMatch ? parseInt(confidenceMatch[1]) : 50;

    // Determine sentiment
    let sentiment = 'neutral';
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes('bullish')) {
      sentiment = 'bullish';
    } else if (lowerContent.includes('bearish')) {
      sentiment = 'bearish';
    } else if (lowerContent.includes('neutral')) {
      sentiment = 'neutral';
    }

    return {
      analysis_text: content,
      confidence_score,
      sentiment,
      cost: 0.0008,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('AI analysis error:', error);
    return {
      analysis_text: 'Analysis temporarily unavailable',
      confidence_score: 0,
      sentiment: 'neutral',
      cost: 0,
      timestamp: new Date(),
    };
  }
}
