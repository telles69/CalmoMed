const { createClient } = require("@supabase/supabase-js")

const SUPABASE_URL = "https://xwcyarzovlpdcalbjiza.supabase.co" // seu URL do projeto
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3Y3lhcnpvdmxwZGNhbGJqaXphIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njk0MDYxNCwiZXhwIjoyMDcyNTE2NjE0fQ.QKtcDHeRq0b930cfea5Kzd5ycHZ_hX-vMaZDHWt3DnU" // coloque sua anon key aqui

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

module.exports = supabase
