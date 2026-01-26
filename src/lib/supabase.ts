import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gcqqqbeufblpzdcwxoxi.supabase.co'
const supabaseAnonKey = 'sb_publishable_SoemcfW6PpW6yGNoYrRpbQ_Rfyx51x2'

// In-memory storage fallback for when localStorage is blocked
const memoryStorage: Record<string, string> = {};

// Custom storage adapter that handles cross-origin/third-party cookie blocking
// This prevents "The operation is insecure" errors in Firefox and strict browsers
const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem(key);
      }
    } catch {
      // localStorage blocked - use memory
    }
    return memoryStorage[key] || null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, value);
        return;
      }
    } catch {
      // localStorage blocked - use memory
    }
    memoryStorage[key] = value;
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(key);
      }
    } catch {
      // localStorage blocked
    }
    delete memoryStorage[key];
  },
};

// Create the Supabase client with safe storage
let supabase: SupabaseClient;

try {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: safeStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
} catch (error) {
  console.error('Failed to create Supabase client:', error);
  // Create a minimal client without persistence as fallback
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: safeStorage,
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

export { supabase };
