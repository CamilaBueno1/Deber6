import { AuthError } from '@supabase/supabase-js';
import { useState, type FormEvent } from 'react';
import { supabase, supabaseConfigError } from '../../../shared/api/supabase';

const hasValidPassword = (value: string) =>
  value.length >= 8 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value);

type ConfirmationState = 'ready' | 'loading' | 'verified' | 'success' | 'error';

function getErrorMessage(error: unknown, isRecovery: boolean) {
  if (error instanceof AuthError) {
    if (error.status === 429) {
      return 'Se hicieron demasiados intentos. Espera un momento antes de probar otra vez.';
    }
    if (error.status === 400 || error.status === 403 || error.status === 422) {
      return isRecovery
        ? 'El enlace venció o ya fue utilizado. Vuelve a StockYa y solicita otro correo de recuperación.'
        : 'El enlace venció o ya fue utilizado. Vuelve a StockYa y solicita otro correo.';
    }
    return error.message;
  }

  if (error instanceof Error) return error.message;
  return isRecovery
    ? 'No pudimos validar el enlace de recuperación. Inténtalo de nuevo.'
    : 'No pudimos verificar tu correo. Inténtalo de nuevo.';
}

export function useConfirmEmail() {
  const searchParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const getParam = (key: string) => searchParams.get(key) ?? hashParams.get(key);
  const tokenHash = getParam('token_hash') ?? getParam('token');
  const authorizationCode = getParam('code');
  const accessToken = getParam('access_token');
  const refreshToken = getParam('refresh_token');
  const linkType = getParam('type');
  const isRecovery = linkType === 'recovery';
  const isSignupLink = linkType === 'signup' || Boolean(authorizationCode && !isRecovery);
  const hasSessionTokens = Boolean(accessToken && refreshToken);
  const missingCredentials = !tokenHash && !authorizationCode && !hasSessionTokens;
  const isBlocked = Boolean(
    supabaseConfigError || missingCredentials || (!isSignupLink && !isRecovery) || !supabase
  );
  const [recoveryVerified, setRecoveryVerified] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [status, setStatus] = useState<ConfirmationState>(() =>
    isBlocked ? 'error' : 'ready'
  );
  const [error, setError] = useState(
    supabaseConfigError ||
      (missingCredentials || (!isSignupLink && !isRecovery)
        ? 'El enlace llegó sin su código de verificación. Vuelve a StockYa y solicita que reenvíen el correo.'
        : '')
  );

  const verifyRecoveryLink = async () => {
    if ((!tokenHash && !authorizationCode && !hasSessionTokens) || !isRecovery || !supabase || status === 'loading' || recoveryVerified) return;

    setStatus('loading');
    setError('');

    try {
      if (tokenHash) {
        const { error: verificationError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'recovery',
        });
        if (verificationError) throw verificationError;
      } else if (authorizationCode) {
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(authorizationCode);
        if (exchangeError) throw exchangeError;
      } else if (accessToken && refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (sessionError) throw sessionError;
      }
      setRecoveryVerified(true);
      setStatus('verified');
    } catch (verificationError) {
      setError(getErrorMessage(verificationError, true));
      setStatus('error');
    }
  };

  const updatePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase || !recoveryVerified || status === 'loading' || status === 'success') return;
    if (!hasValidPassword(password)) {
      setError('La contraseña debe tener 8 caracteres, mayúscula, minúscula y número.');
      setStatus('error');
      return;
    }
    if (password !== passwordConfirmation) {
      setError('Las contraseñas no coinciden. Revísalas e inténtalo otra vez.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setError('');

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      setStatus('success');
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (updateError) {
      setError(getErrorMessage(updateError, true));
      setStatus('error');
    }
  };

  const confirmEmail = async () => {
    if ((!tokenHash && !authorizationCode && !hasSessionTokens) || !isSignupLink || !supabase || status === 'loading' || status === 'success') return;

    setStatus('loading');
    setError('');

    try {
      if (tokenHash) {
        const { error: verificationError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'signup',
        });
        if (verificationError) throw verificationError;
      } else if (authorizationCode) {
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(authorizationCode);
        if (exchangeError) throw exchangeError;
      } else if (accessToken && refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (sessionError) throw sessionError;
      }
      setStatus('success');
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (verificationError) {
      setError(getErrorMessage(verificationError, false));
      setStatus('error');
    }
  };

  return {
    status,
    error,
    isBlocked,
    isRecovery,
    recoveryVerified,
    password,
    setPassword,
    passwordConfirmation,
    setPasswordConfirmation,
    verifyRecoveryLink,
    updatePassword,
    confirmEmail,
  };
}
