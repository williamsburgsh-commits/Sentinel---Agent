/* eslint-disable @typescript-eslint/no-explicit-any */
import { createBrowserClient, Database } from './supabase';
import { AIAnalysis } from './ai-analysis';

export type Sentinel = Database['public']['Tables']['sentinels']['Row'];
export type SentinelInsert = Database['public']['Tables']['sentinels']['Insert'];
export type SentinelUpdate = Database['public']['Tables']['sentinels']['Update'];

export type Activity = Database['public']['Tables']['activities']['Row'];
export type ActivityInsert = Database['public']['Tables']['activities']['Insert'];

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type AIAnalysisRow = {
  id: string;
  sentinel_id: string;
  user_id: string;
  analysis_text: string;
  confidence_score: number;
  sentiment: string;
  cost: number;
  created_at: string;
};

// Sentinel configuration type for creating sentinels
export interface SentinelConfig {
  wallet_address: string;
  private_key: string;
  threshold: number;
  condition: 'above' | 'below';
  payment_method: 'usdc' | 'cash';
  discord_webhook: string;
  network: 'devnet' | 'mainnet';
}

// ==================== PROFILES ====================

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = createBrowserClient();
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
}

export async function updateProfile(userId: string, updates: ProfileUpdate): Promise<Profile | null> {
  const supabase = createBrowserClient();
  
  try {
    // @ts-expect-error - Supabase type inference issue
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

// ==================== SENTINELS ====================

export async function createSentinel(
  userId: string,
  config: SentinelConfig
): Promise<Sentinel | null> {
  const supabase = createBrowserClient();
  
  // If Supabase is not available, throw error to trigger localStorage fallback
  if (!supabase) {
    throw new Error('Supabase not available');
  }
  
  try {
    // First, deactivate all existing sentinels for this user on this network
    await deactivateAllSentinels(userId, config.network);
    
    const sentinelData: SentinelInsert = {
      user_id: userId,
      wallet_address: config.wallet_address,
      private_key: config.private_key,
      threshold: config.threshold,
      condition: config.condition,
      payment_method: config.payment_method,
      discord_webhook: config.discord_webhook,
      network: config.network,
      is_active: true,
    };

    console.log(`📡 Creating sentinel on ${config.network.toUpperCase()}`, {
      wallet: config.wallet_address.substring(0, 8) + '...',
      network: config.network,
      payment_method: config.payment_method,
    });

    // @ts-expect-error - Supabase type inference issue
    const { data, error } = await supabase
      .from('sentinels')
      .insert(sentinelData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating sentinel:', error);
    throw error;
  }
}

export async function saveSentinel(sentinel: SentinelInsert): Promise<Sentinel | null> {
  const supabase = createBrowserClient();
  
  try {
    // @ts-expect-error - Supabase type inference issue
    const { data, error } = await supabase
      .from('sentinels')
      .insert(sentinel)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving sentinel:', error);
    throw error;
  }
}

export async function getSentinels(userId: string, network?: 'devnet' | 'mainnet'): Promise<Sentinel[]> {
  const supabase = createBrowserClient();
  
  // If Supabase is not available, throw error to trigger localStorage fallback
  if (!supabase) {
    throw new Error('Supabase not available');
  }
  
  try {
    let query = supabase
      .from('sentinels')
      .select('*')
      .eq('user_id', userId);
    
    // Filter by network if specified (important for mainnet/devnet separation)
    if (network) {
      query = query.eq('network', network);
      console.log(`🔍 Fetching sentinels for user on ${network.toUpperCase()}`);
    }
    
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    
    console.log(`✅ Found ${data?.length || 0} sentinels${network ? ` on ${network}` : ''}`);
    return data || [];
  } catch (error) {
    console.error('Error fetching sentinels:', error);
    throw error;
  }
}

export async function fetchUserSentinels(userId: string): Promise<Sentinel[]> {
  return getSentinels(userId);
}

export async function getSentinelById(
  sentinelId: string,
  userId: string
): Promise<Sentinel | null> {
  const supabase = createBrowserClient();
  
  try {
    const { data, error } = await supabase
      .from('sentinels')
      .select('*')
      .eq('id', sentinelId)
      .eq('user_id', userId) // Ensure ownership
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error fetching sentinel by ID:', error);
    return null;
  }
}

export async function fetchActiveSentinel(userId: string): Promise<Sentinel | null> {
  const supabase = createBrowserClient();
  
  try {
    const { data, error } = await supabase
      .from('sentinels')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error fetching active sentinel:', error);
    return null;
  }
}

export async function updateSentinel(
  sentinelId: string,
  updates: SentinelUpdate
): Promise<Sentinel | null> {
  const supabase = createBrowserClient();
  
  // If Supabase is not available, throw error to trigger localStorage fallback
  if (!supabase) {
    throw new Error('Supabase not available');
  }
  
  try {
    // @ts-expect-error - Supabase type inference issue
    const { data, error } = await supabase
      .from('sentinels')
      .update(updates)
      .eq('id', sentinelId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating sentinel:', error);
    throw error;
  }
}

export async function deleteSentinel(sentinelId: string): Promise<boolean> {
  const supabase = createBrowserClient();
  
  try {
    const { error } = await supabase
      .from('sentinels')
      .delete()
      .eq('id', sentinelId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting sentinel:', error);
    throw error;
  }
}

export async function deactivateAllSentinels(userId: string, network?: 'devnet' | 'mainnet'): Promise<boolean> {
  const supabase = createBrowserClient();
  
  // If Supabase is not available, throw error to trigger localStorage fallback
  if (!supabase) {
    throw new Error('Supabase not available');
  }
  
  try {
    let query = supabase
      .from('sentinels')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('is_active', true);
    
    // Filter by network if specified
    if (network) {
      query = query.eq('network', network);
      console.log(`⏸️  Deactivating sentinels on ${network.toUpperCase()}`);
    }

    // @ts-expect-error - Supabase type inference issue
    const { error } = await query;

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deactivating sentinels:', error);
    throw error;
  }
}

// ==================== ACTIVITIES ====================

export async function createActivity(
  sentinelId: string,
  userId: string,
  activityData: {
    price: number;
    cost: number;
    settlement_time?: number;
    payment_method?: string;
    transaction_signature?: string;
    triggered?: boolean;
    status?: string;
  }
): Promise<Activity | null> {
  const supabase = createBrowserClient();
  
  try {
    const activity: ActivityInsert = {
      sentinel_id: sentinelId,
      user_id: userId,
      price: activityData.price,
      cost: activityData.cost,
      settlement_time: activityData.settlement_time || null,
      payment_method: activityData.payment_method || null,
      transaction_signature: activityData.transaction_signature || null,
      triggered: activityData.triggered || false,
      status: activityData.status || 'success',
    };

    const { data, error } = await supabase
      .from('activities')
      .insert(activity)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating activity:', error);
    throw error;
  }
}

export async function saveActivity(activity: ActivityInsert): Promise<Activity | null> {
  const supabase = createBrowserClient();
  
  try {
    // @ts-expect-error - Supabase type inference issue
    const { data, error } = await supabase
      .from('activities')
      .insert(activity)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving activity:', error);
    throw error;
  }
}

export async function getActivities(
  sentinelId: string,
  options?: {
    limit?: number;
    offset?: number;
    orderBy?: 'created_at' | 'price';
    ascending?: boolean;
  }
): Promise<{ activities: Activity[]; total: number }> {
  const supabase = createBrowserClient();
  
  try {
    const limit = options?.limit || 50;
    const offset = options?.offset || 0;
    const orderBy = options?.orderBy || 'created_at';
    const ascending = options?.ascending || false;

    // Get total count
    const { count } = await supabase
      .from('activities')
      .select('*', { count: 'exact', head: true })
      .eq('sentinel_id', sentinelId);

    // Get paginated data
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('sentinel_id', sentinelId)
      .order(orderBy, { ascending })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    
    return {
      activities: data || [],
      total: count || 0,
    };
  } catch (error) {
    console.error('Error fetching activities:', error);
    return { activities: [], total: 0 };
  }
}

export async function fetchSentinelActivities(sentinelId: string): Promise<Activity[]> {
  const result = await getActivities(sentinelId);
  return result.activities;
}

export async function fetchUserActivities(userId: string, limit?: number): Promise<Activity[]> {
  const supabase = createBrowserClient();
  
  // If Supabase is not available, throw error to trigger localStorage fallback
  if (!supabase) {
    throw new Error('Supabase not available');
  }
  
  try {
    let query = supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user activities:', error);
    throw error;
  }
}

export async function getActivityStats(
  userId?: string,
  sentinelId?: string
): Promise<{
  total_checks: number;
  total_spent: number;
  alerts_triggered: number;
  success_rate: number;
  avg_cost: number;
  last_check?: string;
}> {
  const supabase = createBrowserClient();
  
  // If Supabase is not available, throw error to trigger localStorage fallback
  if (!supabase) {
    throw new Error('Supabase not available');
  }
  
  try{
    let query = supabase
      .from('activities')
      .select('cost, triggered, status, created_at');

    if (sentinelId) {
      query = query.eq('sentinel_id', sentinelId);
    } else if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) throw error;

    const totalChecks = data?.length || 0;
    const alertsTriggered = data?.filter(a => a.triggered).length || 0;
    const totalSpent = data?.reduce((sum, a) => sum + Number(a.cost), 0) || 0;
    const successCount = data?.filter(a => a.status === 'success').length || 0;
    const successRate = totalChecks ? (successCount / totalChecks) * 100 : 0;
    const avgCost = totalChecks ? totalSpent / totalChecks : 0;
    const lastCheck = data && data.length > 0 ? data[0].created_at : undefined;

    return {
      total_checks: totalChecks,
      total_spent: totalSpent,
      alerts_triggered: alertsTriggered,
      success_rate: successRate,
      avg_cost: avgCost,
      last_check: lastCheck,
    };
  } catch (error) {
    console.error('Error fetching activity stats:', error);
    throw error;
  }
}

// ==================== BATCH OPERATIONS ====================

export async function deleteAllUserData(userId: string): Promise<boolean> {
  const supabase = createBrowserClient();
  
  try {
    // Delete sentinels (activities will cascade delete)
    const { error: sentinelsError } = await supabase
      .from('sentinels')
      .delete()
      .eq('user_id', userId);

    if (sentinelsError) throw sentinelsError;

    // Delete any orphaned activities
    const { error: activitiesError } = await supabase
      .from('activities')
      .delete()
      .eq('user_id', userId);

    if (activitiesError) throw activitiesError;

    return true;
  } catch (error) {
    console.error('Error deleting user data:', error);
    throw error;
  }
}

// ==================== AI ANALYSES ====================

/**
 * Save an AI analysis result to the database
 */
export async function saveAIAnalysis(
  sentinel_id: string,
  user_id: string,
  analysis: AIAnalysis
): Promise<AIAnalysisRow | null> {
  const supabase = createBrowserClient();

  try {
    // @ts-expect-error - Supabase type inference issue
    const { data, error } = await supabase
      .from('ai_analyses')
      .insert({
        sentinel_id,
        user_id,
        analysis_text: analysis.analysis_text,
        confidence_score: analysis.confidence_score,
        sentiment: analysis.sentiment,
        cost: analysis.cost,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving AI analysis:', error);
    return null;
  }
}

/**
 * Get the most recent AI analysis for a sentinel
 */
export async function getLatestAIAnalysis(sentinel_id: string): Promise<AIAnalysisRow | null> {
  const supabase = createBrowserClient();

  try {
    const { data, error } = await supabase
      .from('ai_analyses')
      .select('*')
      .eq('sentinel_id', sentinel_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows found
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting latest AI analysis:', error);
    return null;
  }
}

/**
 * Get AI analysis history for a sentinel
 */
export async function getAIAnalysisHistory(
  sentinel_id: string,
  limit: number = 10
): Promise<AIAnalysisRow[]> {
  const supabase = createBrowserClient();

  try {
    const { data, error } = await supabase
      .from('ai_analyses')
      .select('*')
      .eq('sentinel_id', sentinel_id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting AI analysis history:', error);
    return [];
  }
}

/**
 * Check if we should run a new AI analysis
 * Returns true if there's no previous analysis or if there are 10+ new activities
 */
export async function shouldRunAnalysis(sentinel_id: string): Promise<boolean> {
  const supabase = createBrowserClient();

  try {
    // Get the last analysis
    const lastAnalysis = await getLatestAIAnalysis(sentinel_id);

    // If no previous analysis, run one
    if (!lastAnalysis) {
      return true;
    }

    // Count activities since last analysis
    const { count, error } = await supabase
      .from('activities')
      .select('*', { count: 'exact', head: true })
      .eq('sentinel_id', sentinel_id)
      .gt('created_at', lastAnalysis.created_at);

    if (error) throw error;

    // Run analysis if 3 or more new activities (lowered for testing)
    return (count || 0) >= 3;
  } catch (error) {
    console.error('Error checking if should run analysis:', error);
    return false;
  }
}
