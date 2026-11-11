import { supabase } from '@/shared/lib/supabase';
import type { Venta } from '@/shared/types';

type VentaRow = Omit<Venta, 'cantidad' | 'precio_unitario' | 'costo_unitario' | 'total'> & {
  cantidad: number | string;
  precio_unitario: number | string;
  costo_unitario: number | string;
  total: number | string;
};

const normalizar = (venta: VentaRow): Venta => ({
  ...venta,
  cantidad: Number(venta.cantidad),
  precio_unitario: Number(venta.precio_unitario),
  costo_unitario: Number(venta.costo_unitario),
  total: Number(venta.total),
});

function explicarErrorRegistroCarrito(error: { code?: string; message?: string }) {
  if (error.code === '42501' || /row-level security policy/i.test(error.message ?? '')) {
    return new Error(
      'Supabase bloqueó el registro por sus políticas de seguridad. Ejecuta 004_politicas_ventas_rls.sql y asigna tu usuario a los negocios existentes sin propietario.',
    );
  }
  if (error.code === '42703' && /categoria/i.test(error.message ?? '')) {
    return new Error(
      'Supabase aún tiene una versión antigua del registro de ventas. Ejecuta 002_corregir_categoria_ventas.sql.',
    );
  }
  if (error.code === 'PGRST202' || error.code === '42883') {
    return new Error(
      'No está instalada la función actualizada del carrito. Ejecuta 001_carrito_ventas.sql y 002_corregir_categoria_ventas.sql en Supabase.',
    );
  }
  return error;
}

export async function listarVentasDelDia(negocioId: string, fecha: string): Promise<Venta[]> {
  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .eq('negocio_id', negocioId)
    .eq('fecha', fecha)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((venta) => normalizar(venta as VentaRow));
}

export async function listarVentasDelPeriodo(
  negocioId: string,
  desde: string,
  hasta: string,
): Promise<Venta[]> {
  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .eq('negocio_id', negocioId)
    .gte('fecha', desde)
    .lte('fecha', hasta)
    .order('fecha', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((venta) => normalizar(venta as VentaRow));
}

export async function registrarVenta(productoId: string, cantidad: number, fecha: string) {
  const { data, error } = await supabase.rpc('registrar_venta', {
    p_producto_id: productoId,
    p_cantidad: cantidad,
    p_fecha: fecha,
  });
  if (error) throw error;
  if (!data) throw new Error('La venta no devolvió un comprobante.');
  return normalizar(data as VentaRow);
}

export async function registrarVentaCarrito(
  negocioId: string,
  ticketId: string,
  items: { productoId: string; cantidad: number }[],
  fecha: string,
  cliente: string | null,
  metodoPago: 'efectivo' | 'transferencia',
): Promise<Venta[]> {
  const { data, error } = await supabase.rpc('registrar_venta_carrito', {
    p_ticket_id: ticketId,
    p_negocio_id: negocioId,
    p_items: items.map((item) => ({
      producto_id: item.productoId,
      cantidad: item.cantidad,
    })),
    p_fecha: fecha,
    p_cliente: cliente,
    p_metodo_pago: metodoPago,
  });
  if (error) throw explicarErrorRegistroCarrito(error);
  if (!data) throw new Error('El ticket no devolvió un comprobante.');
  const filas = Array.isArray(data) ? data : [data];
  return (filas as VentaRow[]).map(normalizar);
}
