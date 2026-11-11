import type { Producto } from '@/shared/types';
import { useCallback, useMemo, useState } from 'react';

export type CartItem = {
  producto: Producto;
  cantidad: number;
};

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  const agregar = useCallback((producto: Producto) => {
    setItems((actuales) => {
      const existente = actuales.find((item) => item.producto.id === producto.id);
      if (!existente) return [...actuales, { producto, cantidad: 1 }];
      if (existente.cantidad >= producto.stock) return actuales;

      return actuales.map((item) =>
        item.producto.id === producto.id
          ? { ...item, producto, cantidad: item.cantidad + 1 }
          : item,
      );
    });
  }, []);

  const cambiarCantidad = useCallback((productoId: string, cantidad: number) => {
    setItems((actuales) =>
      actuales.flatMap((item) => {
        if (item.producto.id !== productoId) return [item];
        const nuevaCantidad = Math.min(Math.floor(cantidad), item.producto.stock);
        return nuevaCantidad > 0 ? [{ ...item, cantidad: nuevaCantidad }] : [];
      }),
    );
  }, []);

  const quitar = useCallback((productoId: string) => {
    setItems((actuales) => actuales.filter((item) => item.producto.id !== productoId));
  }, []);

  const vaciar = useCallback(() => setItems([]), []);

  const total = useMemo(
    () => items.reduce((suma, item) => suma + item.producto.precio_venta * item.cantidad, 0),
    [items],
  );
  const cantidadTotal = useMemo(
    () => items.reduce((suma, item) => suma + item.cantidad, 0),
    [items],
  );

  return { items, total, cantidadTotal, agregar, cambiarCantidad, quitar, vaciar };
}
