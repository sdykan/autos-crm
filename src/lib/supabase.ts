import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { demoClient } from './demo/demoClient';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** Without Supabase keys the app runs in demo mode on fictional data stored in the browser */
export const isDemoMode = !url || !key;

export const supabase: SupabaseClient = isDemoMode
    ? (demoClient as unknown as SupabaseClient)
    : createClient(url as string, key as string);
