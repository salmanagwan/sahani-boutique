import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client configuration.
 * For the prototype, all data is served from local mock state.
 * Replace EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY
 * with real values when connecting to a live backend.
 */
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export const STORAGE_BUCKETS = {
  attachments: 'order-attachments',
  measurements: 'measurement-images',
} as const;

export const REALTIME_CHANNELS = {
  orders: 'orders-changes',
  statusHistory: 'status-history-changes',
} as const;
