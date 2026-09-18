import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://edswindcvivkmxevpnxc.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_ooLCNkoWkeuypQR7mSzpxQ_MZ3OxJ7_';

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
