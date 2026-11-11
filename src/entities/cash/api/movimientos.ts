import { supabase } from '@/shared/lib/supabase';
import { listarVentasDelPeriodo } from '@/entities/sale/api/ventas';
import {
  listarAbonosDelPeriodo,
  requiereMigracionCuentasPorCobrar,
} from '@/entities/cash/api/cuentasPorCobrar';
import type { AbonoCuenta } from '@/entities/cash/api/cuentasPorCobrar';
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
  let abonos: AbonoCuenta[] = [];
  try {
    abonos = await listarAbonosDelPeriodo(negocioId, desde, hasta ?? '9999-12-31');
  } catch (error) {
    if (!requiereMigracionCuentasPorCobrar(error)) throw error;
  }

  const ventasPorTicket = new Map<string, typeof ventas>();
  const ventasSinTicket = [];
  for (const venta of ventas) {
    if (!venta.ticket_id) {
      ventasSinTicket.push(venta);
      continue;
    }
    const ticket = ventasPorTicket.get(venta.ticket_id) ?? [];
    ticket.push(venta);
    ventasPorTicket.set(venta.ticket_id, ticket);
  }

  const movimientosDeVentas: Movimiento[] = [
    ...ventasSinTicket.map((venta) => ({
      id: `venta:${venta.id}`,
      negocio_id: venta.negocio_id,
      fecha: venta.fecha,
      tipo: 'venta' as const,
      concepto: venta.producto_nombre,
      cliente: venta.cliente ?? null,
      monto: venta.total,
      costo_directo: venta.costo_unitario * venta.cantidad,
      created_at: venta.created_at,
      origen: 'venta' as const,
      metodo_pago: venta.metodo_pago ?? 'efectivo',
    })),
    ...[...ventasPorTicket.entries()].map(([ticketId, lineas]) => {
      const primerItem = lineas[0];
      const productos = lineas.map(
        (linea) => `${linea.producto_nombre} × ${linea.cantidad}`,
      );
      return {
        id: `ticket:${ticketId}`,
        negocio_id: primerItem.negocio_id,
        fecha: primerItem.fecha,
        tipo: 'venta' as const,
        concepto: productos.join(', '),
        cliente: primerItem.cliente ?? null,
        monto: lineas.reduce((total, linea) => total + linea.total, 0),
        costo_directo: lineas.reduce(
          (total, linea) => total + linea.costo_unitario * linea.cantidad,
          0,
        ),
        created_at: lineas.reduce(
          (masReciente, linea) =>
            linea.created_at > masReciente ? linea.created_at : masReciente,
          primerItem.created_at,
        ),
        origen: 'venta' as const,
        metodo_pago: primerItem.metodo_pago ?? 'efectivo',
      };
    }),
  ];

  const movimientosDeAbonos: Movimiento[] = abonos.map((abono) => ({
    id: `abono:${abono.id}`,
    negocio_id: abono.negocio_id,
    fecha: abono.fecha,
    tipo: 'abono',
    concepto: 'Abono recibido',
    cliente: abono.cliente,
    monto: abono.monto,
    costo_directo: null,
    created_at: abono.created_at,
    origen: 'abono',
    metodo_pago: abono.metodo_pago,
  }));

  return [...movimientos, ...movimientosDeVentas, ...movimientosDeAbonos].sort(
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