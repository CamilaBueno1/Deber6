import type { Session } from '@supabase/supabase-js';

export const nombreUsuario = (session: Session | null) => {
  const meta = session?.user.user_metadata;
  const raw = (meta?.full_name ?? meta?.name ?? session?.user.email?.split('@')[0] ?? '') as string;
  const limpio = raw.trim().split(/\s+/)[0];
  return limpio || 'Emprendedor';
};

export const nombreCompletoUsuario = (session: Session | null) => {
  const meta = session?.user.user_metadata;
  const raw = (meta?.full_name ?? meta?.name ?? '') as string;
  return raw.trim();
};

export const inicialesUsuario = (session: Session | null) => {
  const completo = nombreCompletoUsuario(session) || session?.user.email || 'E';
  const partes = completo.trim().split(/\s+/).filter(Boolean);
  if (partes.length >= 2) {
    return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
  }
  return completo.slice(0, 2).toUpperCase();
};