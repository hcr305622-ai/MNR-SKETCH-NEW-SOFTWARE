import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATION ---
// REPLACE THESE VALUES WITH YOUR ACTUAL SUPABASE PROJECT DETAILS
// You can find these in your Supabase Dashboard -> Settings -> API
const SUPABASE_URL = 'https://xuewhltasrpeblywhaym.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1ZXdobHRhc3JwZWJseXdoYXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNzU1NjQsImV4cCI6MjA4Mzk1MTU2NH0.7kSWCDogL44-zYOfM-RMyme504PAF1PeGxeEuWDCuYw';

// Safe environment variable retrieval
const getEnv = (key: string) => {
  try {
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env) return process.env[key];
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) return import.meta.env[key];
  } catch (e) {
    return undefined;
  }
  return undefined;
};

// Use environment variables if available, otherwise fall back to hardcoded constants
const url = getEnv('REACT_APP_SUPABASE_URL') || getEnv('VITE_SUPABASE_URL') || SUPABASE_URL;
const key = getEnv('REACT_APP_SUPABASE_ANON_KEY') || getEnv('VITE_SUPABASE_ANON_KEY') || SUPABASE_ANON_KEY;

if (url === 'https://YOUR_PROJECT_ID.supabase.co' || key === 'YOUR_ANON_KEY_HERE') {
  console.warn("⚠️ Supabase Credentials not set! Please update 'services/supabaseClient.ts' with your Project URL and Anon Key.");
}

export const supabase = createClient(url, key);