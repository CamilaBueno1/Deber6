import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { supabase } from '@/shared/lib/supabase';

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
  console.info('StockYa OAuth platform:', Platform.OS);
  console.info('StockYa Google OAuth redirect URI:', redirectTo);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: Platform.OS !== 'web' },
  });
  if (error) throw error;

  const requestedRedirect = new URL(data.url).searchParams.get('redirect_to');
  console.info('StockYa Supabase redirect_to:', requestedRedirect);
  if (requestedRedirect !== redirectTo) {
    throw new Error(
      `Supabase está enviando el acceso a ${requestedRedirect ?? 'tu sitio web'} en vez de volver a StockYa. En Supabase, abre Authentication > URL Configuration y agrega exactamente esta dirección a Redirect URLs: ${redirectTo}`
    );
  }

  if (Platform.OS === 'web') return true;

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  console.info('StockYa OAuth browser result:', result.type);

  if (result.type === 'success') {
    const session = await createSessionFromUrl(result.url);
    if (!session) {
      throw new Error('Google volvió a StockYa, pero no recibimos una sesión. Inténtalo de nuevo.');
    }
    return true;
  }

  return false;
}