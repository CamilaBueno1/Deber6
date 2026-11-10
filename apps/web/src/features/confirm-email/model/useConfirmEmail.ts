import { AuthError } from '@supabase/supabase-js';
import { useState, type FormEvent } from 'react';
import { supabase, supabaseConfigError } from '../../../shared/api/supabase';

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
  const tokenHash = searchParams.get('token_hash');
  const linkType = searchParams.get('type');
  const isRecovery = linkType === 'recovery';
  const isSignupLink = linkType === 'signup';
  const isBlocked = Boolean(supabaseConfigError || !tokenHash || (!isSignupLink && !isRecovery) || !supabase);
  const [recoveryVerified, setRecoveryVerified] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [status, setStatus] = useState<ConfirmationState>(() =>
    isBlocked ? 'error' : 'ready'
  );
  const [error, setError] = useState(
    supabaseConfigError ||
      (!tokenHash || (!isSignupLink && !isRecovery)
        ? 'El enlace está incompleto o no es válido. Vuelve a StockYa y solicita uno nuevo.'
        : '')
  );

  const verifyRecoveryLink = async () => {
    if (!tokenHash || !isRecovery || !supabase || status === 'loading' || recoveryVerified) return;

    setStatus('loading');
    setError('');

    try {
      const { error: verificationError } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: 'recovery',
      });

      if (verificationError) throw verificationError;
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
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
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
    if (!tokenHash || !isSignupLink || !supabase || status === 'loading' || status === 'success') return;

    setStatus('loading');
    setError('');

    try {
      const { error: verificationError } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: 'signup',
      });

      if (verificationError) throw verificationError;
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
