import { hoy } from '@/shared/lib/date';
import { showError } from '@/shared/lib/notify';
import { listarProductos } from '@/entities/product/api/productos';
import { listarVentasDelDia } from '@/entities/sale/api/ventas';
import type { Producto, Venta } from '@/shared/types';
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

export function useStockData(negocioId?: string) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [negocioCargadoId, setNegocioCargadoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const solicitud = useRef(0);

  const recargar = useCallback(async () => {
    const solicitudActual = ++solicitud.current;
    if (!negocioId) {
      setProductos([]);
      setVentas([]);
      setNegocioCargadoId(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [listaProductos, listaVentas] = await Promise.all([
        listarProductos(negocioId),
        listarVentasDelDia(negocioId, hoy()),
      ]);
      if (solicitudActual !== solicitud.current) return;
      setProductos(listaProductos);
      setVentas(listaVentas);
      setNegocioCargadoId(negocioId);
    } catch (error) {
      if (solicitudActual === solicitud.current) {
        setProductos([]);
        setVentas([]);
        setNegocioCargadoId(negocioId);
        showError(error, 'No pudimos cargar el inventario');
      }
    } finally {
      if (solicitudActual === solicitud.current) setLoading(false);
    }
  }, [negocioId]);

  useFocusEffect(
    useCallback(() => {
      void recargar();
    }, [recargar])
  );

  const datosActuales = negocioId === negocioCargadoId;
  return {
    productos: datosActuales ? productos : [],
    ventas: datosActuales ? ventas : [],
    loading: loading || Boolean(negocioId && !datosActuales),
    recargar,
  };
}
