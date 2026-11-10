import { supabase } from '@/shared/lib/supabase';
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