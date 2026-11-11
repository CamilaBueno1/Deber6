import { colors } from '@/shared/config/theme';
import { money } from '@/shared/lib/format';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import Card from '@/shared/ui/Card';

type Props = {
  inicio: number;
  ventas: number;
  ventasEnEfectivo: number;
  ventasPorTransferencia: number;
  abonosEnEfectivo: number;
  abonosPorTransferencia: number;
  gastos: number;
  compras: number;
  costoVentas: number;
  resultadoOperativo: number | null;
  ventasSinCosto: number;
  final: number;
  cerrada: boolean;
};

function Fila({
  label,
  valor,
  color,
  icon,
}: {
  label: string;
  valor: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View className="flex-row items-center justify-between py-1">
      <View className="flex-row items-center gap-2">
        <Ionicons name={icon} size={15} color={color} />
        <Text className="text-sm text-[#6E625C]">{label}</Text>
      </View>
      <Text className="text-sm font-bold" style={{ color }}>
        {valor}
      </Text>
    </View>
  );
}

export default function DaySummary({
  inicio,
  ventas,
  ventasEnEfectivo,
  ventasPorTransferencia,
  abonosEnEfectivo,
  abonosPorTransferencia,
  gastos,
  compras,
  costoVentas,
  resultadoOperativo,
  ventasSinCosto,
  final,
  cerrada,
}: Props) {
  return (
    <Card delay={50} className="gap-1.5">
      <View className="mb-1 flex-row items-center justify-between">
        <Text className="text-xs font-bold uppercase tracking-wider text-[#756B65]">Balance de hoy</Text>
        <View
          className={`flex-row items-center gap-1.5 rounded-full px-2.5 py-1 ${
            cerrada ? 'bg-[#F4E7DC]' : 'bg-[#f7efd9]'
          }`}
        >
          <View className={`h-2 w-2 rounded-full ${cerrada ? 'bg-[#D97955]' : 'bg-[#d99a36]'}`} />
          <Text className={`text-xs font-bold ${cerrada ? 'text-[#8B563D]' : 'text-[#9a6b19]'}`}>
            {cerrada ? 'Jornada cerrada' : 'Jornada abierta'}
          </Text>
        </View>
      </View>

      <Fila label="Capital de inicio" valor={money(inicio)} color={colors.ink} icon="sunny-outline" />
      <Fila label="+ Ventas del día" valor={money(ventas)} color={colors.brand} icon="trending-up-outline" />
      {ventasPorTransferencia > 0 ? (
        <Fila
          label="  De esas, transferencia"
          valor={money(ventasPorTransferencia)}
          color={colors.slate}
          icon="swap-horizontal-outline"
        />
      ) : null}
      <Fila
        label="  Ventas en efectivo"
        valor={money(ventasEnEfectivo)}
        color={colors.brand}
        icon="cash-outline"
      />
      {abonosPorTransferencia > 0 ? (
        <Fila
          label="+ Abonos por transferencia"
          valor={money(abonosPorTransferencia)}
          color={colors.slate}
          icon="swap-horizontal-outline"
        />
      ) : null}
      {abonosEnEfectivo > 0 ? (
        <Fila
          label="+ Abonos en efectivo"
          valor={money(abonosEnEfectivo)}
          color={colors.brand}
          icon="cash-outline"
        />
      ) : null}
      <Fila label="− Gastos operativos" valor={money(gastos)} color={colors.warn} icon="trending-down-outline" />
      <Fila label="− Compras (salida de caja)" valor={money(compras)} color={colors.danger} icon="cart-outline" />
      <Fila
        label="Costo directo de las ventas"
        valor={money(costoVentas)}
        color={colors.slate}
        icon="calculator-outline"
      />

      <View className="mt-2 flex-row items-center justify-between rounded-2xl bg-[#F8EDE0] px-3.5 py-3">
        <View>
          <Text className="text-xs font-semibold text-[#756B65]">Dinero actual en caja</Text>
          <Text className="text-xs text-[#6E625C]">
            Resultado operativo:{' '}
            <Text
              className="font-bold"
              style={{
                color:
                  resultadoOperativo === null
                    ? colors.warn
                    : resultadoOperativo >= 0
                      ? colors.brand
                      : colors.danger,
              }}
            >
              {resultadoOperativo === null
                ? ventasSinCosto > 0
                  ? `Pendiente (${ventasSinCosto} venta${ventasSinCosto === 1 ? '' : 's'} sin costo)`
                  : 'Sin ventas para calcular'
                : `${resultadoOperativo >= 0 ? '+' : ''}${money(resultadoOperativo)}`}
            </Text>
          </Text>
        </View>
        <Text className="text-2xl font-extrabold text-[#493A36]">{money(final)}</Text>
      </View>
    </Card>
  );
}
