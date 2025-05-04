const {createClient} = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_API_KEY
);

module.exports = supabase;