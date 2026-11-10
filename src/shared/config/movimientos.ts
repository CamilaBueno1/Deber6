import type { Tipo } from '@/shared/types';
import { colors } from './theme';

export const TIPOS: Record<
  Tipo,
  { label: string; boton: string; color: string; icon: 'cart' | 'flash' | 'basket'; placeholder: string; signo: '+' | '-' }
> = {
  venta: {
    label: 'Venta',
    boton: 'Venta',
    color: colors.brand,
    icon: 'cart',
    placeholder: '¿Qué pidió el cliente? (ej. 2 almuerzos)',
    signo: '+',
  },
  gasto: {
    label: 'Gasto extra',
    boton: 'Gasto',
    color: colors.danger,
    icon: 'flash',
    placeholder: '¿En qué gastaste? (ej. luz, transporte)',
    signo: '-',
  },
  compra: {
    label: 'Compra de insumos',
    boton: 'Compra',
    color: colors.warn,
    icon: 'basket',
    placeholder: '¿Qué compraste? (ej. aceite, harina)',
    signo: '-',
  },
};

export const EMOJIS_NEGOCIO = ['🏪', '🍔', '☕', '💈', '👗', '🛠️', '🥖', '💊', '🍕', '📦'];

export const ICONOS_NEGOCIO = [
  'storefront-outline',
  'restaurant-outline',
  'bag-handle-outline',
  'briefcase-outline',
  'flask-outline',
  'laptop-outline',
  'fast-food-outline',
  'construct-outline',
  'cart-outline',
  'car-outline',
  'shirt-outline',
  'color-palette-outline',
] as const;

export type IconoNegocio = (typeof ICONOS_NEGOCIO)[number];

const ICONOS_POR_EMOJI: Record<string, IconoNegocio> = {
  '🏪': 'storefront-outline',
  '🍔': 'fast-food-outline',
  '☕': 'restaurant-outline',
  '💈': 'briefcase-outline',
  '👗': 'shirt-outline',
  '🛠️': 'construct-outline',
  '🥖': 'restaurant-outline',
  '💊': 'flask-outline',
  '🍕': 'fast-food-outline',
  '📦': 'bag-handle-outline',
  '🍽️': 'restaurant-outline',
  '🛍️': 'bag-handle-outline',
  '💼': 'briefcase-outline',
  '🧴': 'flask-outline',
  '💻': 'laptop-outline',
  '🧑‍🍳': 'fast-food-outline',
  '🧱': 'construct-outline',
  '🛒': 'cart-outline',
  '🚚': 'car-outline',
  '👕': 'shirt-outline',
  '🎨': 'color-palette-outline',
};

export function iconoNegocio(value: string | null): IconoNegocio {
  if (value && (ICONOS_NEGOCIO as readonly string[]).includes(value)) {
    return value as IconoNegocio;
  }
  return value ? ICONOS_POR_EMOJI[value] ?? 'storefront-outline' : 'storefront-outline';
}