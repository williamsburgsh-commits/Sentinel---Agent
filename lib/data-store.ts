/**
 * Unified Data Store
 * Provides a consistent data access layer that works in both browser and server contexts
 * - Browser: uses localStorage
 * - Server: uses in-memory storage via globalThis
 */

import type {
  Sentinel,
  SentinelInsert,
  SentinelUpdate,
  SentinelConfig,
  Activity,
  ActivityInsert,
  AIAnalysisRow,
  ActivityStats,
  Profile,
  ProfileUpdate,
} from '@/types/data';

// ==================== STORAGE KEYS ====================

const STORAGE_KEYS = {
  SENTINELS: 'sentinel_agent_sentinels',
  ACTIVITIES: 'sentinel_agent_activities',
  AI_ANALYSES: 'sentinel_agent_ai_analyses',
  PROFILES: 'sentinel_agent_profiles',
} as const;

// ==================== SERVER-SIDE STORAGE ====================

// Use globalThis to persist data across API requests in server context
declare global {
  // eslint-disable-next-line no-var
  var __sentinelAgentStore: {
    sentinels: Sentinel[];
    activities: Activity[];
    aiAnalyses: AIAnalysisRow[];
    profiles: Profile[];
  } | undefined;
}

function getServerStore() {
  if (!globalThis.__sentinelAgentStore) {
    globalThis.__sentinelAgentStore = {
      sentinels: [],
      activities: [],
      aiAnalyses: [],
      profiles: [],
    };
  }
  return globalThis.__sentinelAgentStore;
}

// ==================== STORAGE ABSTRACTION ====================

const isServer = typeof window === 'undefined';

function getItem(key: string): string | null {
  if (isServer) {
    // Server: use in-memory store
    const store = getServerStore();
    switch (key) {
      case STORAGE_KEYS.SENTINELS:
        return JSON.stringify(store.sentinels);
      case STORAGE_KEYS.ACTIVITIES:
        return JSON.stringify(store.activities);
      case STORAGE_KEYS.AI_ANALYSES:
        return JSON.stringify(store.aiAnalyses);
      case STORAGE_KEYS.PROFILES:
        return JSON.stringify(store.profiles);
      default:
        return null;
    }
  } else {
    // Browser: use localStorage
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }
}

function setItem(key: string, value: string): void {
  if (isServer) {
    // Server: use in-memory store
    const store = getServerStore();
    const parsed = JSON.parse(value);
    switch (key) {
      case STORAGE_KEYS.SENTINELS:
        store.sentinels = parsed;
        break;
      case STORAGE_KEYS.ACTIVITIES:
        store.activities = parsed;
        break;
      case STORAGE_KEYS.AI_ANALYSES:
        store.aiAnalyses = parsed;
        break;
      case STORAGE_KEYS.PROFILES:
        store.profiles = parsed;
        break;
    }
  } else {
    // Browser: use localStorage
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }
}

// ==================== HELPER FUNCTIONS ====================

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getSentinelsFromStorage(): Sentinel[] {
  try {
    const stored = getItem(STORAGE_KEYS.SENTINELS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading sentinels:', error);
    return [];
  }
}

function saveSentinelsToStorage(sentinels: Sentinel[]): void {
  setItem(STORAGE_KEYS.SENTINELS, JSON.stringify(sentinels));
}

function getActivitiesFromStorage(): Activity[] {
  try {
    const stored = getItem(STORAGE_KEYS.ACTIVITIES);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading activities:', error);
    return [];
  }
}

function saveActivitiesToStorage(activities: Activity[]): void {
  setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
}

function getAIAnalysesFromStorage(): AIAnalysisRow[] {
  try {
    const stored = getItem(STORAGE_KEYS.AI_ANALYSES);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading AI analyses:', error);
    return [];
  }
}

function saveAIAnalysesToStorage(analyses: AIAnalysisRow[]): void {
  setItem(STORAGE_KEYS.AI_ANALYSES, JSON.stringify(analyses));
}

function getProfilesFromStorage(): Profile[] {
  try {
    const stored = getItem(STORAGE_KEYS.PROFILES);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading profiles:', error);
    return [];
  }
}

function saveProfilesToStorage(profiles: Profile[]): void {
  setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
}

// ==================== SENTINELS ====================

export async function createSentinel(
  userId: string,
  config: SentinelConfig
): Promise<Sentinel | null> {
  try {
    console.log(`💾 Creating sentinel (${isServer ? 'server' : 'browser'} context)`);

    // Deactivate existing sentinels on this network
    await deactivateAllSentinels(userId, config.network);

    // Create new sentinel
    const now = new Date().toISOString();
    const newSentinel: Sentinel = {
      id: generateId('sentinel'),
      user_id: userId,
      wallet_address: config.wallet_address,
      private_key: config.private_key,
      threshold: config.threshold,
      condition: config.condition,
      payment_method: config.payment_method,
      discord_webhook: config.discord_webhook,
      network: config.network,
      is_active: true,
      created_at: now,
      updated_at: now,
    };

    // Save to storage
    const sentinels = getSentinelsFromStorage();
    sentinels.push(newSentinel);
    saveSentinelsToStorage(sentinels);

    console.log('✅ Sentinel created:', newSentinel.id);
    return newSentinel;
  } catch (error) {
    console.error('Error creating sentinel:', error);
    return null;
  }
}

export async function getSentinels(
  userId: string,
  network?: 'devnet' | 'mainnet'
): Promise<Sentinel[]> {
  try {
    console.log(`💾 Loading sentinels (${isServer ? 'server' : 'browser'} context)`);

    let sentinels = getSentinelsFromStorage();

    // Filter by user
    sentinels = sentinels.filter((s) => s.user_id === userId);

    // Filter by network if specified
    if (network) {
      sentinels = sentinels.filter((s) => s.network === network);
    }

    // Sort by created_at descending
    sentinels.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    console.log(`✅ Loaded ${sentinels.length} sentinels`);
    return sentinels;
  } catch (error) {
    console.error('Error loading sentinels:', error);
    return [];
  }
}

export async function getSentinelById(
  sentinelId: string,
  userId: string
): Promise<Sentinel | null> {
  try {
    const sentinels = getSentinelsFromStorage();
    const sentinel = sentinels.find(
      (s) => s.id === sentinelId && s.user_id === userId
    );
    return sentinel || null;
  } catch (error) {
    console.error('Error fetching sentinel by ID:', error);
    return null;
  }
}

export async function fetchActiveSentinel(userId: string): Promise<Sentinel | null> {
  try {
    const sentinels = getSentinelsFromStorage();
    const active = sentinels
      .filter((s) => s.user_id === userId && s.is_active)
      .sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];
    return active || null;
  } catch (error) {
    console.error('Error fetching active sentinel:', error);
    return null;
  }
}

export async function updateSentinel(
  sentinelId: string,
  updates: SentinelUpdate
): Promise<Sentinel | null> {
  try {
    console.log(`💾 Updating sentinel (${isServer ? 'server' : 'browser'} context):`, sentinelId);

    const sentinels = getSentinelsFromStorage();
    const index = sentinels.findIndex((s) => s.id === sentinelId);

    if (index === -1) {
      console.error('Sentinel not found:', sentinelId);
      return null;
    }

    // Update sentinel
    sentinels[index] = {
      ...sentinels[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    saveSentinelsToStorage(sentinels);

    console.log('✅ Sentinel updated');
    return sentinels[index];
  } catch (error) {
    console.error('Error updating sentinel:', error);
    return null;
  }
}

export async function deleteSentinel(sentinelId: string): Promise<boolean> {
  try {
    console.log(`💾 Deleting sentinel (${isServer ? 'server' : 'browser'} context):`, sentinelId);

    let sentinels = getSentinelsFromStorage();
    sentinels = sentinels.filter((s) => s.id !== sentinelId);
    saveSentinelsToStorage(sentinels);

    console.log('✅ Sentinel deleted');
    return true;
  } catch (error) {
    console.error('Error deleting sentinel:', error);
    return false;
  }
}

export async function deactivateAllSentinels(
  userId: string,
  network?: 'devnet' | 'mainnet'
): Promise<boolean> {
  try {
    console.log(`💾 Deactivating sentinels for user on ${network?.toUpperCase() || 'ALL networks'}`);

    const sentinels = getSentinelsFromStorage();

    // Deactivate matching sentinels
    const updated = sentinels.map((s) => {
      if (s.user_id === userId && s.is_active) {
        if (!network || s.network === network) {
          return { ...s, is_active: false, updated_at: new Date().toISOString() };
        }
      }
      return s;
    });

    saveSentinelsToStorage(updated);

    console.log('✅ Sentinels deactivated');
    return true;
  } catch (error) {
    console.error('Error deactivating sentinels:', error);
    return false;
  }
}

export async function saveSentinel(sentinel: SentinelInsert): Promise<Sentinel | null> {
  try {
    const now = new Date().toISOString();
    const newSentinel: Sentinel = {
      id: generateId('sentinel'),
      ...sentinel,
      created_at: now,
      updated_at: now,
    };

    const sentinels = getSentinelsFromStorage();
    sentinels.push(newSentinel);
    saveSentinelsToStorage(sentinels);

    return newSentinel;
  } catch (error) {
    console.error('Error saving sentinel:', error);
    return null;
  }
}

export async function fetchUserSentinels(userId: string): Promise<Sentinel[]> {
  return getSentinels(userId);
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
  try {
    console.log(`💾 Creating activity (${isServer ? 'server' : 'browser'} context)`);
    console.log('💰 Activity data received:', {
      price: activityData.price,
      cost: activityData.cost,
      priceType: typeof activityData.price,
      costType: typeof activityData.cost,
    });

    // Ensure price is a valid number
    const price = typeof activityData.price === 'number' && !isNaN(activityData.price) 
      ? activityData.price 
      : 0;
    
    const cost = typeof activityData.cost === 'number' && !isNaN(activityData.cost)
      ? activityData.cost
      : 0;

    if (price === 0 && activityData.price !== 0) {
      console.error('⚠️ WARNING: Price was invalid and defaulted to 0!', {
        originalPrice: activityData.price,
        priceType: typeof activityData.price,
      });
    }

    const newActivity: Activity = {
      id: generateId('activity'),
      user_id: userId,
      sentinel_id: sentinelId,
      price: price,
      cost: cost,
      settlement_time: activityData.settlement_time || null,
      payment_method: activityData.payment_method || null,
      transaction_signature: activityData.transaction_signature || null,
      triggered: activityData.triggered || false,
      status: activityData.status || 'success',
      created_at: new Date().toISOString(),
    };

    console.log('💾 Activity object to save:', {
      price: newActivity.price,
      cost: newActivity.cost,
      status: newActivity.status,
    });

    // Get existing activities
    const activities = getActivitiesFromStorage();
    activities.push(newActivity);

    // Keep only last 1000 activities to prevent unbounded growth
    if (activities.length > 1000) {
      activities.splice(0, activities.length - 1000);
    }

    saveActivitiesToStorage(activities);

    console.log('✅ Activity created with price:', newActivity.price, 'and cost:', newActivity.cost);
    return newActivity;
  } catch (error) {
    console.error('Error creating activity:', error);
    return null;
  }
}

export async function saveActivity(activity: ActivityInsert): Promise<Activity | null> {
  try {
    const newActivity: Activity = {
      id: generateId('activity'),
      ...activity,
      settlement_time: activity.settlement_time || null,
      payment_method: activity.payment_method || null,
      transaction_signature: activity.transaction_signature || null,
      triggered: activity.triggered || false,
      status: activity.status || 'success',
      created_at: new Date().toISOString(),
    };

    const activities = getActivitiesFromStorage();
    activities.push(newActivity);

    // Keep only last 1000 activities
    if (activities.length > 1000) {
      activities.splice(0, activities.length - 1000);
    }

    saveActivitiesToStorage(activities);

    return newActivity;
  } catch (error) {
    console.error('Error saving activity:', error);
    return null;
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
  try {
    const limit = options?.limit || 50;
    const offset = options?.offset || 0;
    const orderBy = options?.orderBy || 'created_at';
    const ascending = options?.ascending || false;

    let activities = getActivitiesFromStorage();

    // Filter by sentinel
    activities = activities.filter((a) => a.sentinel_id === sentinelId);

    const total = activities.length;

    // Sort
    activities.sort((a, b) => {
      let comparison = 0;
      if (orderBy === 'created_at') {
        comparison =
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else {
        comparison = a.price - b.price;
      }
      return ascending ? comparison : -comparison;
    });

    // Paginate
    activities = activities.slice(offset, offset + limit);

    return { activities, total };
  } catch (error) {
    console.error('Error fetching activities:', error);
    return { activities: [], total: 0 };
  }
}

export async function fetchSentinelActivities(sentinelId: string): Promise<Activity[]> {
  const result = await getActivities(sentinelId);
  return result.activities;
}

export async function fetchUserActivities(
  userId: string,
  limit?: number
): Promise<Activity[]> {
  try {
    console.log(`💾 Loading activities (${isServer ? 'server' : 'browser'} context)`);

    let activities = getActivitiesFromStorage();

    // Filter by user
    activities = activities.filter((a) => a.user_id === userId);

    // Sort by created_at descending
    activities.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Limit results
    if (limit) {
      activities = activities.slice(0, limit);
    }

    console.log(`✅ Loaded ${activities.length} activities`);
    return activities;
  } catch (error) {
    console.error('Error fetching user activities:', error);
    return [];
  }
}

export async function getActivityStats(
  userId?: string,
  sentinelId?: string
): Promise<ActivityStats> {
  try {
    console.log(`💾 Calculating activity stats (${isServer ? 'server' : 'browser'} context)`);

    let activities = getActivitiesFromStorage();

    // Filter by user or sentinel
    if (sentinelId) {
      activities = activities.filter((a) => a.sentinel_id === sentinelId);
    } else if (userId) {
      activities = activities.filter((a) => a.user_id === userId);
    }

    const totalChecks = activities.length;
    const alertsTriggered = activities.filter((a) => a.triggered).length;
    const totalSpent = activities.reduce((sum, a) => sum + Number(a.cost), 0);
    const successCount = activities.filter((a) => a.status === 'success').length;
    const successRate = totalChecks ? (successCount / totalChecks) * 100 : 0;
    const avgCost = totalChecks ? totalSpent / totalChecks : 0;
    const lastCheck =
      activities.length > 0
        ? activities.sort(
            (a, b) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )[0].created_at
        : undefined;

    const stats = {
      total_checks: totalChecks,
      total_spent: totalSpent,
      alerts_triggered: alertsTriggered,
      success_rate: successRate,
      avg_cost: avgCost,
      last_check: lastCheck,
    };

    console.log('✅ Stats calculated:', stats);
    return stats;
  } catch (error) {
    console.error('Error calculating stats:', error);
    return {
      total_checks: 0,
      total_spent: 0,
      alerts_triggered: 0,
      success_rate: 0,
      avg_cost: 0,
    };
  }
}

// ==================== AI ANALYSES ====================

export async function saveAIAnalysis(
  sentinel_id: string,
  user_id: string,
  analysis: {
    analysis_text: string;
    confidence_score: number;
    sentiment: string;
    cost: number;
  }
): Promise<AIAnalysisRow | null> {
  try {
    console.log(`💾 Saving AI analysis (${isServer ? 'server' : 'browser'} context)`);

    const newAnalysis: AIAnalysisRow = {
      id: generateId('ai_analysis'),
      sentinel_id,
      user_id,
      analysis_text: analysis.analysis_text,
      confidence_score: analysis.confidence_score,
      sentiment: analysis.sentiment,
      cost: analysis.cost,
      created_at: new Date().toISOString(),
    };

    const analyses = getAIAnalysesFromStorage();
    analyses.push(newAnalysis);

    // Keep only last 100 analyses to prevent unbounded growth
    if (analyses.length > 100) {
      analyses.splice(0, analyses.length - 100);
    }

    saveAIAnalysesToStorage(analyses);

    console.log('✅ AI analysis saved');
    return newAnalysis;
  } catch (error) {
    console.error('Error saving AI analysis:', error);
    return null;
  }
}

export async function getLatestAIAnalysis(
  sentinel_id: string
): Promise<AIAnalysisRow | null> {
  try {
    const analyses = getAIAnalysesFromStorage();
    const sentinelAnalyses = analyses
      .filter((a) => a.sentinel_id === sentinel_id)
      .sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

    return sentinelAnalyses[0] || null;
  } catch (error) {
    console.error('Error getting latest AI analysis:', error);
    return null;
  }
}

export async function getAIAnalysisHistory(
  sentinel_id: string,
  limit: number = 10
): Promise<AIAnalysisRow[]> {
  try {
    const analyses = getAIAnalysesFromStorage();
    const sentinelAnalyses = analyses
      .filter((a) => a.sentinel_id === sentinel_id)
      .sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, limit);

    return sentinelAnalyses;
  } catch (error) {
    console.error('Error getting AI analysis history:', error);
    return [];
  }
}

export async function shouldRunAnalysis(sentinel_id: string): Promise<boolean> {
  try {
    // Get the last analysis
    const lastAnalysis = await getLatestAIAnalysis(sentinel_id);

    // If no previous analysis, run one
    if (!lastAnalysis) {
      return true;
    }

    // Count activities since last analysis
    const activities = getActivitiesFromStorage();
    const newActivities = activities.filter(
      (a) =>
        a.sentinel_id === sentinel_id &&
        new Date(a.created_at).getTime() > new Date(lastAnalysis.created_at).getTime()
    );

    // Run analysis if 3 or more new activities (lowered for testing)
    return newActivities.length >= 3;
  } catch (error) {
    console.error('Error checking if should run analysis:', error);
    return false;
  }
}

// ==================== PROFILES ====================

export async function getProfile(userId: string): Promise<Profile | null> {
  try {
    const profiles = getProfilesFromStorage();
    const profile = profiles.find((p) => p.id === userId);
    return profile || null;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
}

export async function updateProfile(
  userId: string,
  updates: ProfileUpdate
): Promise<Profile | null> {
  try {
    const profiles = getProfilesFromStorage();
    const index = profiles.findIndex((p) => p.id === userId);

    if (index === -1) {
      // Create new profile
      const newProfile: Profile = {
        id: userId,
        email: updates.email || null,
        full_name: updates.full_name || null,
        avatar_url: updates.avatar_url || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      profiles.push(newProfile);
      saveProfilesToStorage(profiles);
      return newProfile;
    }

    // Update existing profile
    profiles[index] = {
      ...profiles[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    saveProfilesToStorage(profiles);
    return profiles[index];
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

// ==================== BATCH OPERATIONS ====================

export async function deleteAllUserData(userId: string): Promise<boolean> {
  try {
    // Delete sentinels
    let sentinels = getSentinelsFromStorage();
    sentinels = sentinels.filter((s) => s.user_id !== userId);
    saveSentinelsToStorage(sentinels);

    // Delete activities
    let activities = getActivitiesFromStorage();
    activities = activities.filter((a) => a.user_id !== userId);
    saveActivitiesToStorage(activities);

    // Delete AI analyses
    let analyses = getAIAnalysesFromStorage();
    analyses = analyses.filter((a) => a.user_id !== userId);
    saveAIAnalysesToStorage(analyses);

    return true;
  } catch (error) {
    console.error('Error deleting user data:', error);
    throw error;
  }
}

// ==================== UTILITY FUNCTIONS ====================

export function clearDataStore(): void {
  if (isServer) {
    const store = getServerStore();
    store.sentinels = [];
    store.activities = [];
    store.aiAnalyses = [];
    store.profiles = [];
  } else {
    localStorage.removeItem(STORAGE_KEYS.SENTINELS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
    localStorage.removeItem(STORAGE_KEYS.AI_ANALYSES);
    localStorage.removeItem(STORAGE_KEYS.PROFILES);
  }
  console.log('✅ Data store cleared');
}

export function getDataStoreStats(): {
  sentinels: number;
  activities: number;
  aiAnalyses: number;
  profiles: number;
} {
  return {
    sentinels: getSentinelsFromStorage().length,
    activities: getActivitiesFromStorage().length,
    aiAnalyses: getAIAnalysesFromStorage().length,
    profiles: getProfilesFromStorage().length,
  };
}
