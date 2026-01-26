import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gcqqqbeufblpzdcwxoxi.supabase.co'
const supabaseAnonKey = 'sb_publishable_SoemcfW6PpW6yGNoYrRpbQ_Rfyx51x2'

// Custom storage adapter that handles cross-origin/third-party cookie blocking
// This prevents "The operation is insecure" errors in Firefox
const createSafeStorage = () => {
  const memoryStorage: Record<string, string> = {};
  
  const isStorageAvailable = () => {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  };

  const storageAvailable = isStorageAvailable();

  return {
    getItem: (key: string): string | null => {
      try {
        if (storageAvailable) {
          return localStorage.getItem(key);
        }
        return memoryStorage[key] || null;
      } catch {
        return memoryStorage[key] || null;
      }
    },
    setItem: (key: string, value: string): void => {
      try {
        if (storageAvailable) {
          localStorage.setItem(key, value);
        } else {
          memoryStorage[key] = value;
        }
      } catch {
        memoryStorage[key] = value;
      }
    },
    removeItem: (key: string): void => {
      try {
        if (storageAvailable) {
          localStorage.removeItem(key);
        }
        delete memoryStorage[key];
      } catch {
        delete memoryStorage[key];
      }
    },
  };
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: createSafeStorage(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})
