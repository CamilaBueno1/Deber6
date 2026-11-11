import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (
  import.meta.env.VITE_SUPABASE_URL ?? import.meta.env.EXPO_PUBLIC_SUPABASE_URL
)?.trim();
const supabaseAnonKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  import.meta.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  import.meta.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.EXPO_PUBLIC_SUPABASE_KEY
)?.trim();

export const supabaseConfigError = (() => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return 'Falta configurar la URL o la clave pública de Supabase en el archivo .env de la raíz.';
  }

  try {
    const url = new URL(supabaseUrl);
    if (url.protocol !== 'https:' && url.hostname !== 'localhost') {
      return 'La URL de Supabase debe usar HTTPS.';
    }
  } catch {
    return 'La URL de Supabase no tiene un formato válido.';
  }

  return null;
})();

export const supabase =
  !supabaseConfigError && supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: false,
          detectSessionInUrl: false,
          persistSession: false,
          flowType: 'pkce',
        },
      })
    : null;
