import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yzqzkbtqirmffalygxhe.supabase.co';
const supabaseAnonKey = 'sb_publishable_wUul4eEdUWP7TrxGAwzn6g_Q2UKEixZ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
