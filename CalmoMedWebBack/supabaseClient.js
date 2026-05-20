const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://xwcyarzovlpdcalbjiza.supabase.co'; // seu URL do projeto
const SUPABASE_ANON_KEY = 'SUA_ANON_KEY_AQUI'; // coloque sua anon key aqui

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

module.exports = supabase;
