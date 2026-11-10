import { supabase } from '@/shared/lib/supabase';
import type { Negocio, NegocioInput } from '@/shared/types';

const normalizar = (n: any): Negocio => ({
  ...n,
  capital_inicial: Number(n.capital_inicial),
  meta_diaria: Number(n.meta_diaria ?? 100),
});

export async function listarNegocios(): Promise<Negocio[]> {
  const { data, error } = await supabase.from('negocios').select('*').order('created_at');
  if (error) throw error;
  return (data ?? []).map(normalizar);
}

export async function crearNegocio(input: NegocioInput) {
  const { error } = await supabase.from('negocios').insert(input);
  if (error) throw error;
}

export async function actualizarNegocio(id: string, input: NegocioInput) {
  const { error } = await supabase.from('negocios').update(input).eq('id', id);
  if (error) throw error;
}

export async function eliminarNegocio(id: string) {
  const { error } = await supabase.from('negocios').delete().eq('id', id);
  if (error) throw error;
}