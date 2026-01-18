import { createBrowserClient } from '@supabase/ssr';

/**
 * Creates a Supabase client for browser-side usage
 * This client handles authentication and real-time subscriptions
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      'Supabase credentials not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment variables.'
    );
    // Return a mock client for development without Supabase
    return null as any;
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser() {
  const supabase = createClient();
  if (!supabase) return null;

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }

  return user;
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  const supabase = createClient();
  if (!supabase) return { error: 'Supabase not configured' };

  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
}

/**
 * Sign up with email and password
 */
export async function signUp(email: string, password: string) {
  const supabase = createClient();
  if (!supabase) return { error: 'Supabase not configured' };

  return await supabase.auth.signUp({
    email,
    password,
  });
}

/**
 * Sign out
 */
export async function signOut() {
  const supabase = createClient();
  if (!supabase) return { error: 'Supabase not configured' };

  return await supabase.auth.signOut();
}

/**
 * Sign in with OAuth provider (Google, Facebook, TikTok)
 */
export async function signInWithOAuth(provider: 'google' | 'facebook' | 'tiktok') {
  const supabase = createClient();
  if (!supabase) return { error: 'Supabase not configured' };

  return await supabase.auth.signInWithOAuth({
    provider: provider,
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
    },
  });
}
