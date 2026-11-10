import type { Estado, Jornada, Movimiento, Pulso, Tipo } from '@/shared/types';

export const sumar = (movs: Movimiento[], ...tipos: Tipo[]) =>
  movs.filter((m) => tipos.includes(m.tipo)).reduce((total, m) => total + m.monto, 0);

const redondearMoneda = (monto: number) => Math.round((monto + Number.EPSILON) * 100) / 100;

export const cajaDelDia = (fecha: string, jornadas: Jornada[], movs: Movimiento[]) => {
  const jornada = jornadas.find((j) => j.fecha === fecha);
  const delDia = movs.filter((m) => m.fecha === fecha);
  return (jornada?.capital_inicio ?? 0) + sumar(delDia, 'venta') - sumar(delDia, 'gasto', 'compra');
};

const sumarCostoVentas = (movs: Movimiento[]) =>
  movs.reduce((total, movimiento) => {
    if (movimiento.tipo !== 'venta' || movimiento.costo_directo === null) return total;
    return total + movimiento.costo_directo;
  }, 0);

/**
 * Calcula rentabilidad registrada: ventas - costo directo de ventas - gastos operativos.
 * Las compras se conservan como egresos de caja, pero no se descuentan del resultado
 * hasta que su costo se atribuya a una venta. No estima datos faltantes.
 */
export function calcularPulso(movs: Movimiento[]): Pulso {
  const ventasMovimientos = movs.filter((m) => m.tipo === 'venta');
  const ventas = redondearMoneda(sumar(movs, 'venta'));
  const costoVentas = redondearMoneda(sumarCostoVentas(movs));
  const gastosOperativos = redondearMoneda(sumar(movs, 'gasto'));
  const compras = redondearMoneda(sumar(movs, 'compra'));
  const ventasConCosto = ventasMovimientos.filter((m) => m.costo_directo !== null).length;
  const ventasSinCosto = ventasMovimientos.length - ventasConCosto;
  const egresos = sumar(movs, 'gasto', 'compra');
  const ventasConCostoMonto = redondearMoneda(
    ventasMovimientos.reduce((total, m) => total + (m.costo_directo === null ? 0 : m.monto), 0),
  );
  const coberturaCosteo = ventas > 0 ? ventasConCostoMonto / ventas : null;
  const costeoCompleto = ventasMovimientos.length > 0 && ventasSinCosto === 0;
  const resultadoOperativo = costeoCompleto
    ? redondearMoneda(ventas - costoVentas - gastosOperativos)
    : null;
  const margenOperativo =
    resultadoOperativo !== null && ventas > 0 ? resultadoOperativo / ventas : null;
  const diasConVentas = new Set(ventasMovimientos.map((m) => m.fecha)).size;
  const diasConActividad = new Set(movs.map((m) => m.fecha)).size;

  let estado: Estado;
  let titulo: string;
  let consejo: string;

  if (movs.length === 0) {
    estado = 'sin-datos';
    titulo = 'Sin actividad registrada';
    consejo = 'Registra ventas, su costo directo, gastos y compras para analizar el período.';
  } else if (ventas === 0) {
    estado = 'alerta';
    titulo = 'No hay ventas registradas';
    consejo =
      egresos > 0
        ? 'Hay egresos en el período, pero ninguna venta. Confirma que el registro esté completo antes de evaluar el resultado.'
        : 'No se registraron ventas en el período. Confirma que la información esté al día.';
  } else if (!costeoCompleto) {
    estado = 'alerta';
    titulo = 'Falta costear algunas ventas';
    consejo = `Registra el costo directo de las ${ventasSinCosto} venta${ventasSinCosto === 1 ? '' : 's'} pendiente${ventasSinCosto === 1 ? '' : 's'} para calcular un margen completo.`;
  } else if (resultadoOperativo !== null && resultadoOperativo < 0) {
    estado = 'critico';
    titulo = 'Resultado operativo negativo';
    consejo = 'El costo directo y los gastos operativos registrados superan las ventas. Revisa precios y costos, y valida que los registros estén completos.';
  } else if (resultadoOperativo === 0) {
    estado = 'alerta';
    titulo = 'Operación en equilibrio';
    consejo = 'Las ventas cubren exactamente los costos y gastos registrados. Evalúa precios y costos para generar margen.';
  } else {
    estado = 'positivo';
    titulo = 'Margen operativo positivo';
    consejo =
      diasConVentas < diasConActividad
        ? 'El resultado es positivo según los registros. Revisa los días sin ventas y mantén actualizados todos tus costos y gastos.'
        : 'El resultado es positivo según los registros. Mantén el control de costos y revisa el margen en cada período.';
  }

  return {
    estado,
    titulo,
    consejo,
    ventas,
    costoVentas,
    gastosOperativos,
    compras,
    resultadoOperativo,
    margenOperativo,
    diasConVentas,
    diasConActividad,
    cantidadMovimientos: movs.length,
    ventasConCosto,
    ventasSinCosto,
    coberturaCosteo,
  };
}