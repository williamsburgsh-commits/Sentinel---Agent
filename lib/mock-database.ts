/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Mock Database using localStorage
 * Used when Supabase is not available or for testing
 */

import { Sentinel, Activity, SentinelConfig } from './database';

const STORAGE_KEYS = {
  SENTINELS: 'sentinel_agent_sentinels',
  ACTIVITIES: 'sentinel_agent_activities',
};

// ==================== SENTINELS ====================

export async function createSentinel(
  userId: string,
  config: SentinelConfig
): Promise<Sentinel | null> {
  try {
    console.log('💾 Using localStorage for sentinel storage (Supabase unavailable)');
    
    // Deactivate existing sentinels on this network
    await deactivateAllSentinels(userId, config.network);
    
    // Create new sentinel
    const newSentinel: Sentinel = {
      id: `sentinel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      wallet_address: config.wallet_address,
      private_key: config.private_key,
      threshold: config.threshold,
      condition: config.condition,
      payment_method: config.payment_method,
      discord_webhook: config.discord_webhook,
      network: config.network,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    // Get existing sentinels
    const sentinels = getSentinelsFromStorage();
    sentinels.push(newSentinel);
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEYS.SENTINELS, JSON.stringify(sentinels));
    
    console.log('✅ Sentinel created in localStorage:', newSentinel.id);
    return newSentinel;
  } catch (error) {
    console.error('Error creating sentinel in localStorage:', error);
    return null;
  }
}

export async function getSentinels(
  userId: string,
  network?: 'devnet' | 'mainnet'
): Promise<Sentinel[]> {
  try {
    console.log('💾 Loading sentinels from localStorage');
    
    let sentinels = getSentinelsFromStorage();
    
    // Filter by user
    sentinels = sentinels.filter(s => s.user_id === userId);
    
    // Filter by network if specified
    if (network) {
      sentinels = sentinels.filter(s => s.network === network);
    }
    
    // Sort by created_at descending
    sentinels.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    console.log(`✅ Loaded ${sentinels.length} sentinels from localStorage`);
    return sentinels;
  } catch (error) {
    console.error('Error loading sentinels from localStorage:', error);
    return [];
  }
}

export async function updateSentinel(
  sentinelId: string,
  updates: Partial<Sentinel>
): Promise<Sentinel | null> {
  try {
    console.log('💾 Updating sentinel in localStorage:', sentinelId);
    
    const sentinels = getSentinelsFromStorage();
    const index = sentinels.findIndex(s => s.id === sentinelId);
    
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
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEYS.SENTINELS, JSON.stringify(sentinels));
    
    console.log('✅ Sentinel updated in localStorage');
    return sentinels[index];
  } catch (error) {
    console.error('Error updating sentinel in localStorage:', error);
    return null;
  }
}

export async function deleteSentinel(sentinelId: string): Promise<boolean> {
  try {
    console.log('💾 Deleting sentinel from localStorage:', sentinelId);
    
    let sentinels = getSentinelsFromStorage();
    sentinels = sentinels.filter(s => s.id !== sentinelId);
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEYS.SENTINELS, JSON.stringify(sentinels));
    
    console.log('✅ Sentinel deleted from localStorage');
    return true;
  } catch (error) {
    console.error('Error deleting sentinel from localStorage:', error);
    return false;
  }
}

export async function deactivateAllSentinels(
  userId: string,
  network: 'devnet' | 'mainnet'
): Promise<void> {
  try {
    console.log(`💾 Deactivating all sentinels for user on ${network.toUpperCase()}`);
    
    const sentinels = getSentinelsFromStorage();
    
    // Deactivate matching sentinels
    const updated = sentinels.map(s => {
      if (s.user_id === userId && s.network === network && s.is_active) {
        return { ...s, is_active: false, updated_at: new Date().toISOString() };
      }
      return s;
    });
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEYS.SENTINELS, JSON.stringify(updated));
    
    console.log('✅ Sentinels deactivated in localStorage');
  } catch (error) {
    console.error('Error deactivating sentinels in localStorage:', error);
  }
}

// ==================== ACTIVITIES ====================

export async function createActivity(
  userId: string,
  sentinelId: string,
  activity: {
    price: number;
    condition_met: boolean;
    notification_sent: boolean;
    cost: number;
  }
): Promise<Activity | null> {
  try {
    console.log('💾 Creating activity in localStorage');
    
    const newActivity: Activity = {
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      sentinel_id: sentinelId,
      price: activity.price,
      condition_met: activity.condition_met,
      notification_sent: activity.notification_sent,
      cost: activity.cost,
      created_at: new Date().toISOString(),
    };
    
    // Get existing activities
    const activities = getActivitiesFromStorage();
    activities.push(newActivity);
    
    // Keep only last 100 activities
    if (activities.length > 100) {
      activities.splice(0, activities.length - 100);
    }
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
    
    console.log('✅ Activity created in localStorage');
    return newActivity;
  } catch (error) {
    console.error('Error creating activity in localStorage:', error);
    return null;
  }
}

export async function fetchUserActivities(
  userId: string,
  limit = 20
): Promise<Activity[]> {
  try {
    console.log('💾 Loading activities from localStorage');
    
    let activities = getActivitiesFromStorage();
    
    // Filter by user
    activities = activities.filter(a => a.user_id === userId);
    
    // Sort by created_at descending
    activities.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    // Limit results
    activities = activities.slice(0, limit);
    
    console.log(`✅ Loaded ${activities.length} activities from localStorage`);
    return activities;
  } catch (error) {
    console.error('Error loading activities from localStorage:', error);
    return [];
  }
}

export async function getActivityStats(
  userId?: string,
  sentinelId?: string
): Promise<{ total_checks: number; total_spent: number; last_check?: string }> {
  try {
    console.log('💾 Calculating activity stats from localStorage');
    
    let activities = getActivitiesFromStorage();
    
    // Filter by user or sentinel
    if (userId) {
      activities = activities.filter(a => a.user_id === userId);
    }
    if (sentinelId) {
      activities = activities.filter(a => a.sentinel_id === sentinelId);
    }
    
    const stats = {
      total_checks: activities.length,
      total_spent: activities.reduce((sum, a) => sum + (a.cost || 0), 0),
      last_check: activities.length > 0 ? activities[0].created_at : undefined,
    };
    
    console.log('✅ Stats calculated:', stats);
    return stats;
  } catch (error) {
    console.error('Error calculating stats from localStorage:', error);
    return { total_checks: 0, total_spent: 0 };
  }
}

// ==================== HELPER FUNCTIONS ====================

function getSentinelsFromStorage(): Sentinel[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SENTINELS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading sentinels from localStorage:', error);
    return [];
  }
}

function getActivitiesFromStorage(): Activity[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading activities from localStorage:', error);
    return [];
  }
}

// ==================== UTILITY FUNCTIONS ====================

export function clearMockDatabase(): void {
  localStorage.removeItem(STORAGE_KEYS.SENTINELS);
  localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
  console.log('✅ Mock database cleared');
}

export function getMockDatabaseStats(): { sentinels: number; activities: number } {
  return {
    sentinels: getSentinelsFromStorage().length,
    activities: getActivitiesFromStorage().length,
  };
}

