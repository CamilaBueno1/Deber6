import { colors } from '@/shared/config/theme';
import { useCountUp } from '@/shared/lib/hooks/useCountUp';
import { money } from '@/shared/lib/format';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

type Props = {
  caja: number;
  ventas: number;
  egresos: number;
  resultadoOperativo: number | null;
};

type KpiItem = {
  titulo: string;
  subtitulo: string;
  valor: number;
  pendiente?: boolean;
  pendienteLabel?: string;
  icono: keyof typeof Ionicons.glyphMap;
  color: string;
};

function KpiCardItem({ item, index }: { item: KpiItem; index: number }) {
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(14);
  const scale = useSharedValue(1);
  const valor = useCountUp(item.valor, 900);

  useEffect(() => {
    const delay = 100 + index * 70;
    opacity.set(withDelay(delay, withTiming(1, { duration: 300 })));
    translateY.set(withDelay(delay, withSpring(0, { damping: 16, stiffness: 180 })));
  }, [index, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.get(),
    transform: [{ translateY: translateY.get() }, { scale: scale.get() }],
  }));

  return (
    <Animated.View
      style={[
        {
          width: '48.2%',
          shadowColor: '#243b38',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 2,
        },
        animatedStyle,
      ]}
    >
      <Pressable
        onPressIn={() => {
          scale.set(withSpring(0.97, { damping: 15, stiffness: 300 }));
        }}
        onPressOut={() => {
          scale.set(withSpring(1, { damping: 14, stiffness: 260 }));
        }}
        className="rounded-[26px] border border-white bg-[#fffefa] p-4"
      >
        <View className="flex-row items-center justify-between">
          <View
            className="h-10 w-10 items-center justify-center rounded-2xl"
            style={{ backgroundColor: item.color + '20' }}
          >
            <Ionicons name={item.icono} size={20} color={item.color} />
          </View>
          <View className="rounded-full bg-[#f4efe4] px-2 py-0.5">
            <Text className="text-[10px] font-bold text-[#71817b]">{item.subtitulo}</Text>
          </View>
        </View>
        <Text className="mt-3 text-xs font-semibold text-[#71817b]">{item.titulo}</Text>
        <Text
          className="mt-0.5 text-xl font-extrabold text-[#243b38]"
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.75}
        >
          {item.pendiente ? (item.pendienteLabel ?? 'Pendiente') : money(valor)}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export default function KpiGrid({ caja, ventas, egresos, resultadoOperativo }: Props) {
  const items: KpiItem[] = [
    { titulo: 'Dinero en caja', subtitulo: 'Disponible', valor: caja, icono: 'wallet-outline', color: colors.info },
    { titulo: 'Ventas de hoy', subtitulo: 'Ingresos', valor: ventas, icono: 'trending-up-outline', color: colors.brand },
    { titulo: 'Egresos en caja', subtitulo: 'Salidas', valor: egresos, icono: 'trending-down-outline', color: colors.danger },
    {
      titulo: 'Resultado operativo',
      subtitulo:
        resultadoOperativo === null
          ? ventas === 0
            ? 'Sin ventas'
            : 'Costeo pendiente'
          : resultadoOperativo >= 0
            ? 'Positivo'
            : 'Negativo',
      valor: resultadoOperativo ?? 0,
      pendiente: resultadoOperativo === null,
      pendienteLabel: ventas === 0 ? 'Sin ventas' : 'Pendiente',
      icono: 'sparkles-outline',
      color:
        resultadoOperativo === null
          ? colors.warn
          : resultadoOperativo >= 0
            ? colors.brand
            : colors.danger,
    },
  ];

  return (
    <View className="flex-row flex-wrap justify-between gap-y-3">
      {items.map((k, idx) => (
        <KpiCardItem key={k.titulo} item={k} index={idx} />
      ))}
    </View>
  );
}
