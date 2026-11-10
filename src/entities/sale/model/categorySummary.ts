import { claveCategoria, nombreCategoria } from '@/shared/lib/category';
import type { Venta } from '@/shared/types';

export type ResumenCategoria = {
  categoria: string;
  unidades: number;
  ingresos: number;
  transacciones: number;
};

export function resumirVentasPorCategoria(ventas: Venta[]): ResumenCategoria[] {
  const resumen = new Map<string, ResumenCategoria>();

  for (const venta of ventas) {
    const categoria = nombreCategoria(venta.categoria);
    const clave = claveCategoria(categoria);
    const actual = resumen.get(clave) ?? {
      categoria,
      unidades: 0,
      ingresos: 0,
      transacciones: 0,
    };

    actual.unidades += venta.cantidad;
    actual.ingresos += venta.total;
    actual.transacciones += 1;
    resumen.set(clave, actual);
  }

  return [...resumen.values()].sort(
    (a, b) =>
      b.ingresos - a.ingresos ||
      b.unidades - a.unidades ||
      a.categoria.localeCompare(b.categoria, 'es'),
  );
}
