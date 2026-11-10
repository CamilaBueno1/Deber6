import { listarVentasDelPeriodo } from '@/entities/sale/api/ventas';
import { resumirVentasPorCategoria } from '@/entities/sale/model/categorySummary';
import { diasAtras, hoy } from '@/shared/lib/date';
import { showError } from '@/shared/lib/notify';
import type { Venta } from '@/shared/types';
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

export function useCategorySales(negocioId?: string) {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [negocioCargadoId, setNegocioCargadoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const solicitud = useRef(0);

  const recargar = useCallback(async () => {
    const solicitudActual = ++solicitud.current;
    if (!negocioId) {
      setVentas([]);
      setNegocioCargadoId(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const lista = await listarVentasDelPeriodo(negocioId, diasAtras(6), hoy());
      if (solicitudActual === solicitud.current) {
        setVentas(lista);
        setNegocioCargadoId(negocioId);
      }
    } catch (error) {
      if (solicitudActual === solicitud.current) {
        setVentas([]);
        setNegocioCargadoId(negocioId);
        showError(error, 'No pudimos cargar las ventas por categoría');
      }
    } finally {
      if (solicitudActual === solicitud.current) setLoading(false);
    }
  }, [negocioId]);

  useFocusEffect(
    useCallback(() => {
      void recargar();
      return () => {
        solicitud.current += 1;
      };
    }, [recargar]),
  );

  return {
    categorias: resumirVentasPorCategoria(negocioId === negocioCargadoId ? ventas : []),
    loading: loading || Boolean(negocioId && negocioCargadoId !== negocioId),
  };
}
