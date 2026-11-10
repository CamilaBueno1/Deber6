import { supabase } from '@/shared/lib/supabase';
import { listarVentasDelPeriodo } from '@/entities/sale/api/ventas';
import type { Movimiento, MovimientoInput } from '@/shared/types';

const normalizar = (m: any): Movimiento => ({
  ...m,
  monto: Number(m.monto),
  costo_directo: m.costo_directo == null ? null : Number(m.costo_directo),
});

export async function listarMovimientos(negocioId: string, desde: string, hasta?: string): Promise<Movimiento[]> {
  let consulta = supabase
    .from('movimientos')
    .select('*')
    .eq('negocio_id', negocioId)
    .gte('fecha', desde)
    .order('created_at', { ascending: false });
  if (hasta) consulta = consulta.lte('fecha', hasta);

  const { data, error } = await consulta;
  if (error) throw error;
  return (data ?? []).map(normalizar);
}

export const listarDelDia = (negocioId: string, fecha: string) => listarMovimientos(negocioId, fecha, fecha);

export async function listarActividadCaja(
  negocioId: string,
  desde: string,
  hasta?: string,
): Promise<Movimiento[]> {
  const [movimientos, ventas] = await Promise.all([
    listarMovimientos(negocioId, desde, hasta),
    listarVentasDelPeriodo(negocioId, desde, hasta ?? '9999-12-31'),
  ]);

  const movimientosDeVentas: Movimiento[] = ventas.map((venta) => ({
    id: `venta:${venta.id}`,
    negocio_id: venta.negocio_id,
    fecha: venta.fecha,
    tipo: 'venta',
    concepto: venta.producto_nombre,
    cliente: null,
    monto: venta.total,
    costo_directo: venta.costo_unitario * venta.cantidad,
    created_at: venta.created_at,
    origen: 'venta',
  }));

  return [...movimientos, ...movimientosDeVentas].sort(
    (a, b) => b.created_at.localeCompare(a.created_at),
  );
}

export async function crearMovimiento(negocioId: string, fecha: string, input: MovimientoInput) {
  const { error } = await supabase.from('movimientos').insert({ negocio_id: negocioId, fecha, ...input });
  if (error) throw error;
}

export async function actualizarMovimiento(id: string, input: MovimientoInput) {
  const { error } = await supabase.from('movimientos').update(input).eq('id', id);
  if (error) throw error;
}

export async function eliminarMovimiento(id: string) {
  const { error } = await supabase.from('movimientos').delete().eq('id', id);
  if (error) throw error;
}