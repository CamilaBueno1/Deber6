import { hoy } from '@/shared/lib/date';
import { showError } from '@/shared/lib/notify';
import { obtenerJornada, obtenerJornadaAnterior } from '@/entities/cash/api/jornadas';
import { listarActividadCaja } from '@/entities/cash/api/movimientos';
import { cajaDelDia } from '@/entities/cash/model/pulse';
import type { Jornada, Movimiento } from '@/shared/types';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

/** Jornada y movimientos del día de hoy. */
export function useCajaDelDia(negocioId?: string) {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [jornada, setJornada] = useState<Jornada | null>(null);
  const [capitalSugerido, setCapitalSugerido] = useState<number | null>(null);

  const recargar = useCallback(async () => {
    if (!negocioId) return;
    try {
      const fecha = hoy();
      const [movs, jor, jornadaAnterior] = await Promise.all([
        listarActividadCaja(negocioId, fecha, fecha),
        obtenerJornada(negocioId, fecha),
        obtenerJornadaAnterior(negocioId, fecha),
      ]);
      const movimientosAnteriores = jornadaAnterior
        ? await listarActividadCaja(negocioId, jornadaAnterior.fecha, jornadaAnterior.fecha)
        : [];
      setCapitalSugerido(
        jornadaAnterior
          ? cajaDelDia(jornadaAnterior.fecha, [jornadaAnterior], movimientosAnteriores)
          : null,
      );
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

  return { movimientos, jornada, capitalSugerido, recargar };
}