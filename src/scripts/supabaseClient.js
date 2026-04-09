import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wufgfgadhvprxdkcducx.supabase.co';
const supabaseKey = 'sb_publishable_RQEs3xlyjHfIs2X3Ql6jbQ_KsKkQZze';

export const supabase = createClient(supabaseUrl, supabaseKey);