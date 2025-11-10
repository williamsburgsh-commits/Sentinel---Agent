import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Database types
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      sentinels: {
        Row: {
          id: string;
          user_id: string;
          wallet_address: string;
          private_key: string;
          threshold: number;
          condition: 'above' | 'below';
          payment_method: 'usdc' | 'cash';
          discord_webhook: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          wallet_address: string;
          private_key: string;
          threshold: number;
          condition: 'above' | 'below';
          payment_method: 'usdc' | 'cash';
          discord_webhook: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          wallet_address?: string;
          private_key?: string;
          threshold?: number;
          condition?: 'above' | 'below';
          payment_method?: 'usdc' | 'cash';
          discord_webhook?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      activities: {
        Row: {
          id: string;
          sentinel_id: string | null;
          user_id: string;
          price: number;
          cost: number;
          settlement_time: number | null;
          payment_method: string | null;
          transaction_signature: string | null;
          triggered: boolean;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          sentinel_id?: string | null;
          user_id: string;
          price: number;
          cost: number;
          settlement_time?: number | null;
          payment_method?: string | null;
          transaction_signature?: string | null;
          triggered?: boolean;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          sentinel_id?: string | null;
          user_id?: string;
          price?: number;
          cost?: number;
          settlement_time?: number | null;
          payment_method?: string | null;
          transaction_signature?: string | null;
          triggered?: boolean;
          status?: string;
          created_at?: string;
        };
      };
      ai_analyses: {
        Row: {
          id: string;
          sentinel_id: string;
          user_id: string;
          analysis_text: string;
          confidence_score: number;
          sentiment: string;
          cost: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          sentinel_id: string;
          user_id: string;
          analysis_text: string;
          confidence_score: number;
          sentiment: string;
          cost: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          sentinel_id?: string;
          user_id?: string;
          analysis_text?: string;
          confidence_score?: number;
          sentiment?: string;
          cost?: number;
          created_at?: string;
        };
      };
    };
  };
};

// Use globalThis to ensure singleton persists across hot reloads in development
interface GlobalWithSupabase {
  __supabaseBrowserClient?: SupabaseClient<Database>;
}

const getSupabaseBrowserClient = (): SupabaseClient<Database> | undefined => {
  return (globalThis as GlobalWithSupabase).__supabaseBrowserClient;
};

const setSupabaseBrowserClient = (client: SupabaseClient<Database>) => {
  (globalThis as GlobalWithSupabase).__supabaseBrowserClient = client;
};

// Client-side Supabase client (for use in Client Components)
export const createBrowserClient = (): SupabaseClient<Database> | null => {
  // Return existing instance if available
  const existingClient = getSupabaseBrowserClient();
  if (existingClient) {
    return existingClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️  Supabase environment variables not configured - running in localStorage-only mode');
    return null;
  }
  
  // Create and cache the instance
  const client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'sb-auth-token',
    },
  });

  setSupabaseBrowserClient(client);
  return client;
};

// Note: Server-side client should be created in server components/API routes
// using createServerComponentClient from '@supabase/auth-helpers-nextjs'
// and cookies() from 'next/headers'

// Admin client (for server-side operations that bypass RLS)
export const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

// Note: Session and user helpers should be used in server components
// For client components, use supabase.auth.getSession() or supabase.auth.getUser() directly
