import { supabase } from '@/shared/lib/supabase';
import type { Jornada } from '@/shared/types';

const normalizar = (j: any): Jornada => ({ ...j, capital_inicio: Number(j.capital_inicio) });

export async function listarJornadas(negocioId: string, desde: string, hasta?: string): Promise<Jornada[]> {
  let consulta = supabase
    .from('jornadas')
    .select('*')
    .eq('negocio_id', negocioId)
    .gte('fecha', desde)
    .order('fecha');
  if (hasta) consulta = consulta.lte('fecha', hasta);
  const { data, error } = await consulta;
  if (error) throw error;
  return (data ?? []).map(normalizar);
}

export async function obtenerJornada(negocioId: string, fecha: string): Promise<Jornada | null> {
  const { data, error } = await supabase
    .from('jornadas')
    .select('*')
    .eq('negocio_id', negocioId)
    .eq('fecha', fecha)
    .maybeSingle();
  if (error) throw error;
  return data ? normalizar(data) : null;
}

export async function obtenerJornadaAnterior(negocioId: string, fecha: string): Promise<Jornada | null> {
  const { data, error } = await supabase
    .from('jornadas')
    .select('*')
    .eq('negocio_id', negocioId)
    .lt('fecha', fecha)
    .order('fecha', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? normalizar(data) : null;
}

export async function abrirJornada(negocioId: string, fecha: string, capitalInicio: number) {
  const { error } = await supabase
    .from('jornadas')
    .insert({ negocio_id: negocioId, fecha, capital_inicio: capitalInicio });
  if (error) {
    if (error.code === '23505') {
      const jornadaExistente = await obtenerJornada(negocioId, fecha);
      if (jornadaExistente) return;
    }
    throw error;
  }
}

export async function cerrarJornada(id: string) {
  const { error } = await supabase.from('jornadas').update({ cerrada: true }).eq('id', id);
  if (error) throw error;
}

export async function reabrirJornada(id: string) {
  const { error } = await supabase.from('jornadas').update({ cerrada: false }).eq('id', id);
  if (error) throw error;
}
