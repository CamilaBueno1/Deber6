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
