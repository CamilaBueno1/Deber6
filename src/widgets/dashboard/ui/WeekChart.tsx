import { colors } from '@/shared/config/theme';
import { diasAtras, hoy, inicialDia } from '@/shared/lib/date';
import { money } from '@/shared/lib/format';
import { sumar } from '@/entities/cash/model/pulse';
import type { Movimiento } from '@/shared/types';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import Card from '@/shared/ui/Card';

const ALTO_MAX = 88;

function AnimatedBar({
  targetHeight,
  color,
  delay,
}: {
  targetHeight: number;
  color: string;
  delay: number;
}) {
  const height = useSharedValue(4);

  useEffect(() => {
    height.set(4);
    height.set(
      withDelay(delay, withSpring(Math.max(4, targetHeight), { damping: 15, stiffness: 150 })),
    );
  }, [delay, height, targetHeight]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.get(),
  }));

  return (
    <Animated.View
      style={[
        {
          width: 11,
          backgroundColor: color,
          borderTopLeftRadius: 6,
          borderTopRightRadius: 6,
        },
        animatedStyle,
      ]}
    />
  );
}

export default function WeekChart({ movimientos }: { movimientos: Movimiento[] }) {
  const fechaHoy = hoy();
  const dias = Array.from({ length: 7 }, (_, i) => {
    const fecha = diasAtras(6 - i);
    const delDia = movimientos.filter((m) => m.fecha === fecha);
    return {
      fecha,
      inicial: inicialDia(fecha),
      esHoy: fecha === fechaHoy,
      ventas: sumar(delDia, 'venta'),
      egresos: sumar(delDia, 'gasto', 'compra'),
    };
  });

  const maximo = Math.max(1, ...dias.flatMap((d) => [d.ventas, d.egresos]));
  const totalVentas = dias.reduce((acc, d) => acc + d.ventas, 0);
  const totalEgresos = dias.reduce((acc, d) => acc + d.egresos, 0);

  return (
    <Card delay={180} className="gap-3.5">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-base font-bold text-[#243b38]">Actividad de la semana</Text>
          <Text className="text-xs text-[#71817b]">
            Ventas {money(totalVentas)} · Gastos {money(totalEgresos)}
          </Text>
        </View>
        <View className="flex-row items-center gap-3">
          <View className="flex-row items-center gap-1.5">
            <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors.brand }} />
            <Text className="text-xs font-medium text-[#71817b]">Ventas</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors.accent }} />
            <Text className="text-xs font-medium text-[#71817b]">Gastos</Text>
          </View>
        </View>
      </View>

      <View className="h-32 flex-row items-end justify-between rounded-2xl bg-[#f7f2e7]/80 px-3 pb-2.5 pt-4">
        {dias.map((d, index) => (
          <View key={d.fecha} className="items-center gap-1.5">
            <View className="flex-row items-end gap-1">
              <AnimatedBar
                targetHeight={(d.ventas / maximo) * ALTO_MAX}
                color={colors.brand}
                delay={120 + index * 45}
              />
              <AnimatedBar
                targetHeight={(d.egresos / maximo) * ALTO_MAX}
                color={colors.accent}
                delay={145 + index * 45}
              />
            </View>
            <View
              className={`rounded-full px-1.5 py-0.5 ${
                d.esHoy ? 'bg-[#246b61]' : 'bg-transparent'
              }`}
            >
              <Text
                className={`text-[10px] font-bold ${
                  d.esHoy ? 'text-white' : 'text-[#71817b]'
                }`}
              >
                {d.esHoy ? 'Hoy' : d.inicial}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}
