import { money } from '@/shared/lib/format';
import type { Pulso } from '@/shared/types';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import Card from '@/shared/ui/Card';

const COLOR_ESTADO: Record<Pulso['estado'], string> = {
  'sin-datos': '#867A72',
  positivo: '#D97955',
  alerta: '#D99A36',
  critico: '#D66A54',
};

function Indicador({ label, value }: { label: string; value: string }) {
  return (
    <View className="w-1/2 gap-0.5 py-1">
      <Text className="text-[11px] font-medium text-[#756B65]">{label}</Text>
      <Text className="text-base font-bold text-[#493A36]" numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  );
}

export default function PulseCard({ pulso }: { pulso: Pulso }) {
  const color = COLOR_ESTADO[pulso.estado];
  const margen =
    pulso.margenOperativo === null
      ? 'No disponible'
      : `${(pulso.margenOperativo * 100).toFixed(1)}%`;
  const cobertura =
    pulso.coberturaCosteo === null ? 'No disponible' : `${(pulso.coberturaCosteo * 100).toFixed(0)}%`;

  return (
    <Card animated={false} className="gap-4">
      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-1 gap-2">
          <Text className="text-[11px] font-bold uppercase tracking-wider text-[#756B65]">
            Rentabilidad registrada · últimos 7 días
          </Text>
          <View
            className="flex-row items-center gap-2 self-start rounded-full px-3 py-1"
            style={{ backgroundColor: `${color}22` }}
          >
            <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
            <Text className="text-xs font-extrabold" style={{ color }}>
              {pulso.titulo}
            </Text>
          </View>
        </View>
        <View
          className="h-11 w-11 items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${color}18` }}
        >
          <Ionicons name="analytics-outline" size={22} color={color} />
        </View>
      </View>

      <View className="rounded-2xl bg-[#f7f2e7] p-3.5">
        <Text className="text-xs font-semibold text-[#756B65]">Resultado operativo registrado</Text>
        <Text
          className="mt-1 text-3xl font-extrabold"
          style={{
            color:
              pulso.resultadoOperativo === null
                ? COLOR_ESTADO.alerta
                : pulso.resultadoOperativo < 0
                  ? COLOR_ESTADO.critico
                  : '#493A36',
          }}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.75}
        >
          {pulso.resultadoOperativo === null
            ? pulso.ventas === 0
              ? 'Sin ventas'
              : 'Pendiente'
            : money(pulso.resultadoOperativo)}
        </Text>
        <Text className="mt-0.5 text-[11px] text-[#756B65]">
          Ventas − costo directo vendido − gastos operativos registrados
        </Text>
      </View>

      <View className="flex-row flex-wrap">
        <Indicador label="Ventas registradas" value={money(pulso.ventas)} />
        <Indicador label="Costo directo vendido" value={money(pulso.costoVentas)} />
        <Indicador label="Gastos operativos" value={money(pulso.gastosOperativos)} />
        <Indicador label="Compras pagadas (caja)" value={money(pulso.compras)} />
        <Indicador label="Margen operativo" value={margen} />
        <Indicador label="Ventas con costo" value={`${pulso.ventasConCosto} de ${pulso.ventasConCosto + pulso.ventasSinCosto}`} />
        <Indicador label="Cobertura del costeo" value={cobertura} />
        <Indicador label="Días con ventas" value={`${pulso.diasConVentas} de 7`} />
      </View>

      <View className="flex-row items-start gap-2.5 rounded-2xl bg-[#f7f2e7] p-3">
        <Ionicons name="bulb-outline" size={18} color="#d99a36" style={{ marginTop: 1 }} />
        <Text className="flex-1 text-xs leading-4.5 text-[#6E625C]">
          <Text className="font-bold text-[#493A36]">Lectura: </Text>
          {pulso.consejo}
        </Text>
      </View>

      <Text className="text-[10px] leading-4 text-[#867A72]">
        Margen operativo = (ventas − costo directo vendido − gastos operativos) ÷ ventas. Las
        compras afectan la caja, pero no se restan otra vez del resultado; se requiere costear cada
        venta. No contempla impuestos ni costos no registrados.
      </Text>
    </Card>
  );
}
