/**
 * Coinbase Developer Platform (CDP) Client
 * 
 * This module provides a centralized CDP client for server-side operations.
 * It includes defensive checks for environment variables and provides descriptive
 * errors when misconfigured.
 * 
 * Environment Variables Required:
 * - CDP_API_KEY: Your CDP API key
 * - CDP_API_SECRET: Your CDP API secret
 * - CDP_PROJECT_ID: Your CDP project ID
 * - CDP_BASE_URL (optional): Custom base URL for CDP API
 */

interface CDPConfig {
  apiKey: string;
  apiSecret: string;
  projectId: string;
  baseUrl?: string;
}

interface CDPClient {
  config: CDPConfig;
  isConfigured: boolean;
  getConfigError: () => string | null;
}

/**
 * Validates CDP configuration from environment variables
 * Returns error message if misconfigured, null if valid
 */
function validateCDPConfig(): string | null {
  const missing: string[] = [];
  
  if (!process.env.CDP_API_KEY) {
    missing.push('CDP_API_KEY');
  }
  if (!process.env.CDP_API_SECRET) {
    missing.push('CDP_API_SECRET');
  }
  if (!process.env.CDP_PROJECT_ID) {
    missing.push('CDP_PROJECT_ID');
  }
  
  if (missing.length > 0) {
    return `CDP configuration incomplete. Missing environment variables: ${missing.join(', ')}. Please check your .env.local file and ensure all CDP credentials are set.`;
  }
  
  return null;
}

/**
 * Get CDP configuration from environment variables
 * Throws descriptive error if misconfigured
 */
function getCDPConfig(): CDPConfig {
  const error = validateCDPConfig();
  if (error) {
    throw new Error(error);
  }
  
  return {
    apiKey: process.env.CDP_API_KEY!,
    apiSecret: process.env.CDP_API_SECRET!,
    projectId: process.env.CDP_PROJECT_ID!,
    baseUrl: process.env.CDP_BASE_URL,
  };
}

/**
 * Initialize CDP client with lazy loading
 * Returns null if configuration is invalid
 */
let cdpClientInstance: CDPClient | null = null;

export function getCDPClient(): CDPClient {
  if (cdpClientInstance) {
    return cdpClientInstance;
  }
  
  const error = validateCDPConfig();
  
  if (error) {
    console.warn('⚠️ CDP SDK not configured:', error);
    cdpClientInstance = {
      config: {
        apiKey: '',
        apiSecret: '',
        projectId: '',
      },
      isConfigured: false,
      getConfigError: () => error,
    };
  } else {
    const config = getCDPConfig();
    console.log('✅ CDP SDK configured successfully');
    cdpClientInstance = {
      config,
      isConfigured: true,
      getConfigError: () => null,
    };
  }
  
  return cdpClientInstance;
}

/**
 * Check if CDP is properly configured
 */
export function isCDPConfigured(): boolean {
  const client = getCDPClient();
  return client.isConfigured;
}

/**
 * Get CDP configuration error (if any)
 */
export function getCDPConfigError(): string | null {
  const client = getCDPClient();
  return client.getConfigError();
}

/**
 * Get CDP API configuration for use with external SDK
 * Throws descriptive error if not configured
 */
export function getCDPApiConfig() {
  const client = getCDPClient();
  
  if (!client.isConfigured) {
    throw new Error(
      client.getConfigError() || 'CDP SDK is not configured. Please check your environment variables.'
    );
  }
  
  return client.config;
}

/**
 * Validate CDP configuration and log status
 * Call this on server startup to fail fast
 */
export function validateCDPOnStartup(): void {
  const client = getCDPClient();
  
  if (!client.isConfigured) {
    console.error('❌ CDP SDK CONFIGURATION ERROR:', client.getConfigError());
    console.error('   CDP embedded wallets will NOT be available.');
    console.error('   Please configure CDP environment variables in .env.local');
    console.error('   See SETUP.md for configuration instructions.');
  } else {
    console.log('✅ CDP SDK initialized successfully');
    console.log(`   Project ID: ${client.config.projectId}`);
    if (client.config.baseUrl) {
      console.log(`   Base URL: ${client.config.baseUrl}`);
    }
  }
}

// Export config for use in other modules
export const cdpConfig = {
  get apiKey() {
    return getCDPClient().config.apiKey;
  },
  get apiSecret() {
    return getCDPClient().config.apiSecret;
  },
  get projectId() {
    return getCDPClient().config.projectId;
  },
  get baseUrl() {
    return getCDPClient().config.baseUrl;
  },
};
