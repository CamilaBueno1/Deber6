import { hoy } from '@/shared/lib/date';
import { showError } from '@/shared/lib/notify';
import { obtenerJornada } from '@/entities/cash/api/jornadas';
import { listarDelDia } from '@/entities/cash/api/movimientos';
import type { Jornada, Movimiento } from '@/shared/types';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

/** Jornada y movimientos del día de hoy. */
export function useCajaDelDia(negocioId?: string) {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [jornada, setJornada] = useState<Jornada | null>(null);

  const recargar = useCallback(async () => {
    if (!negocioId) return;
    try {
      const fecha = hoy();
      const [movs, jor] = await Promise.all([listarDelDia(negocioId, fecha), obtenerJornada(negocioId, fecha)]);
      setMovimientos(movs);
      setJornada(jor);
    } catch (e) {
      showError(e, 'No pudimos cargar tu caja');
    }
  }, [negocioId]);

  useFocusEffect(
    useCallback(() => {
      recargar();
    }, [recargar])
  );

  return { movimientos, jornada, recargar };
}