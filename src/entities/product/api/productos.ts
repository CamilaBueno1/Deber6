import { supabase } from '@/shared/lib/supabase';
import type { Producto, ProductoInput } from '@/shared/types';

type ProductoRow = Omit<Producto, 'foto_url'>;

const normalizar = (producto: ProductoRow): Producto => {
  const { data } = producto.foto_path
    ? supabase.storage.from('product-images').getPublicUrl(producto.foto_path)
    : { data: { publicUrl: null } };

  return {
    ...producto,
    precio_venta: Number(producto.precio_venta),
    costo: Number(producto.costo),
    stock: Number(producto.stock),
    stock_minimo: Number(producto.stock_minimo),
    foto_url: data.publicUrl,
  };
};

export async function listarProductos(negocioId: string): Promise<Producto[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('negocio_id', negocioId)
    .order('nombre');
  if (error) throw error;
  return (data ?? []).map((producto) => normalizar(producto as ProductoRow));
}

export async function crearProducto(negocioId: string, input: ProductoInput) {
  const { error } = await supabase.from('products').insert({ negocio_id: negocioId, ...input });
  if (error) throw error;
}

export async function actualizarProducto(id: string, input: ProductoInput) {
  const { error } = await supabase.from('products').update(input).eq('id', id);
  if (error) throw error;
}

export async function eliminarProducto(id: string) {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

export async function eliminarFotoProducto(path: string) {
  const { error } = await supabase.storage.from('product-images').remove([path]);
  if (error) throw error;
}

function decodificarBase64(base64: string): ArrayBuffer {
  const limpio = base64.replace(/[^A-Za-z0-9+/=]/g, '');
  const relleno = limpio.endsWith('==') ? 2 : limpio.endsWith('=') ? 1 : 0;
  const bytes = new Uint8Array(Math.floor((limpio.length * 3) / 4) - relleno);
  const alfabeto = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let acumulado = 0;
  let bits = 0;
  let indice = 0;

  for (const caracter of limpio) {
    if (caracter === '=') break;
    acumulado = (acumulado << 6) | alfabeto.indexOf(caracter);
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes[indice] = (acumulado >> bits) & 0xff;
      indice += 1;
    }
  }

  return bytes.buffer;
}

export async function subirFotoProducto(negocioId: string, base64: string) {
  if (base64.length > 7 * 1024 * 1024) {
    throw new Error('La foto debe pesar menos de 5 MB.');
  }

  const archivo = decodificarBase64(base64);
  if (archivo.byteLength > 5 * 1024 * 1024) {
    throw new Error('La foto debe pesar menos de 5 MB.');
  }

  const path = `${negocioId}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpeg`;
  const { error } = await supabase.storage.from('product-images').upload(path, archivo, {
    contentType: 'image/jpeg',
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from('product-images').getPublicUrl(path);
  return { path, url: data.publicUrl };
}
