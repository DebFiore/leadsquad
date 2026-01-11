import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jbksiufkzftpghldidyg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impia3NpdWZremZ0cGdobGRpZHlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwODg1NzgsImV4cCI6MjA4MzY2NDU3OH0.PqlvDLLdewFodde9MaMR5wkZV9anxW55kxC365FRAxQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
