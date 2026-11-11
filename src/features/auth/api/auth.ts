import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { supabase } from '@/shared/lib/supabase';

export async function verifyCurrentPassword(password: string) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user?.email) throw new Error('No encontramos tu cuenta para verificar la contraseña.');

  const providers = user.app_metadata?.providers ?? [];
  const hasPassword =
    (Array.isArray(providers) && providers.includes('email')) ||
    user.user_metadata?.password_setup_completed === true;
  if (!hasPassword) {
    return true;
  }

  const { error } = await supabase.auth.signInWithPassword({ email: user.email, password });
  if (error) throw error;
  return true;
}

export async function changePassword(current: string | null, next: string) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error('Tu sesión no está disponible.');

  const providers = user.app_metadata?.providers ?? [];
  const hasPassword =
    (Array.isArray(providers) && providers.includes('email')) ||
    user.user_metadata?.password_setup_completed === true;

  if (hasPassword && (!current || !current.trim())) {
    throw new Error('Debes escribir tu contraseña actual.');
  }

  if (current && current.trim()) {
    await verifyCurrentPassword(current);
  }

  const { error } = await supabase.auth.updateUser({
    password: next,
    data: {
      ...user.user_metadata,
      password_setup_completed: true,
      password_setup_prompted: true,
    },
  });
  if (error) throw error;
  return true;
}

export async function dismissGooglePasswordSetup() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error('Tu sesión no está disponible.');

  const { error } = await supabase.auth.updateUser({
    data: { ...user.user_metadata, password_setup_prompted: true },
  });
  if (error) throw error;
}

WebBrowser.maybeCompleteAuthSession();

export const redirectTo = makeRedirectUri({
  native: 'emprendegest://login',
  path: 'login',
});
export const loginRedirectTo = redirectTo;
export const emailConfirmationRedirectTo = 'https://deb-peach.vercel.app';
export const resetRedirectTo = emailConfirmationRedirectTo;

const authUrlPromises = new Map<string, ReturnType<typeof exchangeSessionFromUrl>>();

function getAuthUrlKey(url: string) {
  const parsedUrl = new URL(url);
  const hashParams = new URLSearchParams(parsedUrl.hash.replace(/^#/, ''));
  const getParam = (key: string) => parsedUrl.searchParams.get(key) ?? hashParams.get(key);
  const code = getParam('code');
  if (code) return `code:${code}`;

  const accessToken = getParam('access_token');
  return accessToken ? `token:${accessToken}` : url;
}

function exchangeSessionFromUrl(url: string) {
  const parsedUrl = new URL(url);
  const hashParams = new URLSearchParams(parsedUrl.hash.replace(/^#/, ''));
  const queryParams = parsedUrl.searchParams;
  const getParam = (key: string) => queryParams.get(key) ?? hashParams.get(key);

  const errorDescription = getParam('error_description');
  if (errorDescription) return Promise.reject(new Error(errorDescription));

  const code = getParam('code');
  if (code) {
    return supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
      if (error) throw error;
      return data.session;
    });
  }

  const accessToken = getParam('access_token');
  const refreshToken = getParam('refresh_token');
  if (!accessToken || !refreshToken) return Promise.resolve(null);

  return supabase.auth
    .setSession({ access_token: accessToken, refresh_token: refreshToken })
    .then(({ data, error }) => {
      if (error) throw error;
      return data.session;
    });
}

export async function createSessionFromUrl(url: string) {
  const key = getAuthUrlKey(url);
  const existingRequest = authUrlPromises.get(key);
  if (existingRequest) return existingRequest;

  const request = exchangeSessionFromUrl(url);
  authUrlPromises.set(key, request);
  setTimeout(() => {
    if (authUrlPromises.get(key) === request) authUrlPromises.delete(key);
  }, 30_000);
  return request;
}

export async function signInWithGoogle(): Promise<boolean> {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: Platform.OS !== 'web' },
  });
  if (error) throw error;

  const requestedRedirect = new URL(data.url).searchParams.get('redirect_to');
  if (requestedRedirect !== redirectTo) {
    throw new Error(
      `Supabase está enviando el acceso a ${requestedRedirect ?? 'tu sitio web'} en vez de volver a StockYa. En Supabase, abre Authentication > URL Configuration y agrega exactamente esta dirección a Redirect URLs: ${redirectTo}`
    );
  }

  if (Platform.OS === 'web') return true;

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type === 'success') {
    const session = await createSessionFromUrl(result.url);
    if (!session) {
      throw new Error('Google volvió a StockYa, pero no recibimos una sesión. Inténtalo de nuevo.');
    }
    return true;
  }

  return false;
}