import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://qmimzhflxkftukpvkmld.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_3aTmoXi5yb3UMS8MiDKCPg_U8EIR1Bb';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
