import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Child = {
  id: string;
  user_id: string;
  name: string;
  age: number | null;
  group_name: string | null;
  created_at: string;
};

export type Response = {
  id: string;
  child_id: string;
  date: string;
  mood: 1 | 2 | 3;
  played: boolean;
  bullied: boolean;
  event_type: string | null;
  notes: string | null;
  created_at: string;
};
