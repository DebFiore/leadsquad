import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gcqqqbeufblpzdcwxoxi.supabase.co'
const supabaseAnonKey = 'sb_publishable_SoemcfW6PpW6yGNoYrRpbQ_Rfyx51x2'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
