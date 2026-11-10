import { showError } from '@/shared/lib/notify';
import { listarNegocios } from '@/entities/business/api/negocios';
import type { Negocio } from '@/shared/types';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/entities/session/model/AuthContext';

type NegocioState = {
  negocios: Negocio[];
  selected: Negocio | null;
  select: (id: string) => void;
  reload: () => Promise<void>;
  loading: boolean;
};

const NegocioContext = createContext<NegocioState>({
  negocios: [],
  selected: null,
  select: () => {},
  reload: async () => {},
  loading: true,
});

export const useNegocio = () => useContext(NegocioContext);

export function NegocioProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user.id ?? null;
  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!userId) {
      setNegocios([]);
      setSelectedId(null);
      setLoading(false);
      return;
    }
    try {
      const lista = await listarNegocios();
      setNegocios(lista);
      setSelectedId((actual) => (actual && lista.some((n) => n.id === actual) ? actual : lista[0]?.id ?? null));
    } catch (e) {
      showError(e, 'No pudimos cargar tus negocios');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    let active = true;
    if (!userId) {
      Promise.resolve().then(() => {
        if (!active) return;
        setNegocios([]);
        setSelectedId(null);
        setLoading(false);
      });
      return () => {
        active = false;
      };
    }

    listarNegocios()
      .then((lista) => {
        if (!active) return;
        setNegocios(lista);
        setSelectedId((actual) => (actual && lista.some((n) => n.id === actual) ? actual : lista[0]?.id ?? null));
      })
      .catch((e) => {
        if (active) showError(e, 'No pudimos cargar tus negocios');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [userId]);

  const activeNegocios = useMemo(() => (userId ? negocios : []), [userId, negocios]);
  const selected = useMemo(
    () => activeNegocios.find((n) => n.id === selectedId) ?? activeNegocios[0] ?? null,
    [activeNegocios, selectedId]
  );

  return (
    <NegocioContext.Provider value={{ negocios: activeNegocios, selected, select: setSelectedId, reload, loading }}>
      {children}
    </NegocioContext.Provider>
  );
}
