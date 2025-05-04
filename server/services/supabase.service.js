const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://pruanbeczixldbrdjdcc.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBydWFuYmVjeml4bGRicmRqZGNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4NDUxNzAsImV4cCI6MjA2MTQyMTE3MH0.IpRooxwE4gYVOHYAa8lVCyt77DSKYxxiOfs0iQeLDjg'
);

module.exports = supabase;
