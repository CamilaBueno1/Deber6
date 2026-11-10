import { supabase } from '@/shared/lib/supabase';
import { showError } from '@/shared/lib/notify';
import type { Session } from '@supabase/supabase-js';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

type AuthState = {
  session: Session | null;
  loading: boolean;
};

const AuthContext = createContext<AuthState>({
  session: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const authEventReceived = { current: false };

    const { data: sub } = supabase.auth.onAuthStateChange((_evento, nueva) => {
      authEventReceived.current = true;
      if (active) setSession(nueva);
    });

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) throw error;
        if (active && !authEventReceived.current) setSession(data.session);
      })
      .catch((error: unknown) => {
        if (active) showError(error, 'No pudimos recuperar tu sesión');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}