import type { Producto } from '@/shared/types';
import { claveCategoria, normalizarCategoria, SIN_CATEGORIA } from '@/shared/lib/category';

export { nombreCategoria } from '@/shared/lib/category';

export function categoriasExistentes(productos: Producto[]): string[] {
  const categorias = new Map<string, string>();
  for (const producto of productos) {
    const categoria = normalizarCategoria(producto.categoria);
    if (categoria) categorias.set(claveCategoria(categoria), categoria);
  }
  return [...categorias.values()].sort((a, b) => a.localeCompare(b, 'es'));
}

export function categoriasDeInventario(productos: Producto[]): string[] {
  const categorias = categoriasExistentes(productos);
  if (productos.some((producto) => !normalizarCategoria(producto.categoria))) {
    categorias.push(SIN_CATEGORIA);
  }
  return categorias;
}
