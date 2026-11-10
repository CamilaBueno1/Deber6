export const SIN_CATEGORIA = 'Sin categoría';

export function normalizarCategoria(categoria: string | null | undefined): string | null {
  const normalizada = categoria?.trim().replace(/\s+/g, ' ');
  return normalizada || null;
}

export function nombreCategoria(categoria: string | null | undefined): string {
  return normalizarCategoria(categoria) ?? SIN_CATEGORIA;
}

export function claveCategoria(categoria: string | null | undefined): string {
  return nombreCategoria(categoria).toLocaleLowerCase('es');
}
