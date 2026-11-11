import { supabase } from '@/shared/lib/supabase';

export type CuentaPorCobrar = {
  id: string;
  negocio_id: string;
  cliente: string;
  concepto: string;
  monto: number;
  saldo: number;
  fecha: string;
  created_at: string;
};

export type AbonoCuenta = {
  id: string;
  cuenta_id: string;
  negocio_id: string;
  cliente: string;
  monto: number;
  metodo_pago: 'efectivo' | 'transferencia';
  fecha: string;
  created_at: string;
};

type CuentaRow = Omit<CuentaPorCobrar, 'monto' | 'saldo'> & {
  monto: number | string;
  saldo: number | string;
};

type AbonoRow = Omit<AbonoCuenta, 'monto'> & {
  monto: number | string;
};

export class CuentasPorCobrarMigrationError extends Error {
  constructor() {
    super('Pendientes por cobrar requiere la migración supabase/migrations/003_cuentas_por_cobrar.sql.');
    this.name = 'CuentasPorCobrarMigrationError';
  }
}

export function requiereMigracionCuentasPorCobrar(error: unknown): boolean {
  return error instanceof CuentasPorCobrarMigrationError;
}

function convertirErrorMigracion(error: { code?: string }) {
  if (['PGRST202', 'PGRST205', '42P01', '42883'].includes(error.code ?? '')) {
    return new CuentasPorCobrarMigrationError();
  }
  return error;
}

const normalizarCuenta = (cuenta: CuentaRow): CuentaPorCobrar => ({
  ...cuenta,
  monto: Number(cuenta.monto),
  saldo: Number(cuenta.saldo),
});

const normalizarAbono = (abono: AbonoRow): AbonoCuenta => ({
  ...abono,
  monto: Number(abono.monto),
});

export async function listarCuentasPendientes(negocioId: string): Promise<CuentaPorCobrar[]> {
  const { data, error } = await supabase
    .from('cuentas_por_cobrar')
    .select('*')
    .eq('negocio_id', negocioId)
    .gt('saldo', 0)
    .order('created_at', { ascending: true });

  if (error) throw convertirErrorMigracion(error);
  return (data ?? []).map((cuenta) => normalizarCuenta(cuenta as CuentaRow));
}

export async function listarAbonosDelPeriodo(
  negocioId: string,
  desde: string,
  hasta: string,
): Promise<AbonoCuenta[]> {
  const { data, error } = await supabase
    .from('abonos_cuentas')
    .select('*')
    .eq('negocio_id', negocioId)
    .gte('fecha', desde)
    .lte('fecha', hasta)
    .order('created_at', { ascending: false });

  if (error) throw convertirErrorMigracion(error);
  return (data ?? []).map((abono) => normalizarAbono(abono as AbonoRow));
}

export async function crearCuentaPorCobrar(
  negocioId: string,
  cliente: string,
  concepto: string,
  monto: number,
  fecha: string,
): Promise<void> {
  const { error } = await supabase.from('cuentas_por_cobrar').insert({
    negocio_id: negocioId,
    cliente,
    concepto,
    monto,
    saldo: monto,
    fecha,
  });
  if (error) throw convertirErrorMigracion(error);
}

export async function registrarAbonoCuenta(
  cuentaId: string,
  negocioId: string,
  monto: number,
  metodoPago: 'efectivo' | 'transferencia',
  fecha: string,
): Promise<void> {
  const { data, error } = await supabase.rpc('registrar_abono_cuenta', {
    p_cuenta_id: cuentaId,
    p_negocio_id: negocioId,
    p_monto: monto,
    p_metodo_pago: metodoPago,
    p_fecha: fecha,
  });
  if (error) throw convertirErrorMigracion(error);
  if (!data) throw new Error('No se confirmó el abono de la cuenta.');
}
