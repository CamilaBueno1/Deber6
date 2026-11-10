import { diasAtras, hoy } from '@/shared/lib/date';
import { showError } from '@/shared/lib/notify';
import { listarJornadas } from '@/entities/cash/api/jornadas';
import { listarActividadCaja } from '@/entities/cash/api/movimientos';
import type { Jornada, Movimiento } from '@/shared/types';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

/** Movimientos y jornadas de los últimos 7 días. Se recarga cada vez que la pantalla toma foco. */
export function useDashboardData(negocioId?: string) {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [jornadas, setJornadas] = useState<Jornada[]>([]);

  const recargar = useCallback(async () => {
    if (!negocioId) {
      setMovimientos([]);
      setJornadas([]);
      return;
    }
    try {
      const desde = diasAtras(6);
      const hasta = hoy();
      const [movs, jors] = await Promise.all([
        listarActividadCaja(negocioId, desde, hasta),
        listarJornadas(negocioId, desde, hasta),
      ]);
      setMovimientos(movs);
      setJornadas(jors);
    } catch (e) {
      showError(e, 'No pudimos cargar tu información');
    }
  }, [negocioId]);

  useFocusEffect(
    useCallback(() => {
      recargar();
    }, [recargar])
  );

  return { movimientos, jornadas, recargar };
}