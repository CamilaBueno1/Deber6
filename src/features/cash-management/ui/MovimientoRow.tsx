import { TIPOS } from '@/shared/config/movimientos';
import { money } from '@/shared/lib/format';
import type { Movimiento } from '@/shared/types';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

type Props = { movimiento: Movimiento; onEdit: () => void; onDelete: () => void };

export default function MovimientoRow({ movimiento, onEdit, onDelete }: Props) {
  const t = TIPOS[movimiento.tipo];
  const opacity = useSharedValue(1);
  const translateX = useSharedValue(-8);

  useEffect(() => {
    opacity.set(withTiming(1, { duration: 220 }));
    translateX.set(withSpring(0, { damping: 16, stiffness: 200 }));
  }, [opacity, translateX]);

  const rowStyle = useAnimatedStyle(() => ({
    opacity: opacity.get(),
    transform: [{ translateX: translateX.get() }],
  }));

  return (
    <Animated.View style={rowStyle}>
      <View className="flex-row items-center gap-3 border-b border-[#ece6da] py-3">
        <View
          className="h-10 w-10 items-center justify-center rounded-2xl"
          style={{ backgroundColor: t.color + '20' }}
        >
          <Ionicons name={t.icon} size={19} color={t.color} />
        </View>
        <View className="flex-1">
          <Text className="font-bold text-[#243b38]" numberOfLines={1}>
            {movimiento.concepto}
          </Text>
          <Text className="text-xs text-[#879792]">
            {t.label}
            {movimiento.cliente ? ` · ${movimiento.cliente}` : ''}
            {movimiento.tipo === 'venta' && movimiento.costo_directo !== null
              ? ` · Costo ${money(movimiento.costo_directo)}`
              : movimiento.tipo === 'venta'
                ? ' · Falta costo'
                : ''}
          </Text>
        </View>
        <Text className="text-base font-extrabold" style={{ color: t.color }}>
          {t.signo}
          {money(movimiento.monto)}
        </Text>
        <View className="flex-row items-center gap-1.5">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Editar ${movimiento.concepto}`}
            onPress={onEdit}
            hitSlop={6}
            className="h-8 w-8 items-center justify-center rounded-full bg-[#f4efe4] active:opacity-70"
          >
            <Ionicons name="create-outline" size={16} color="#5d706c" />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Eliminar ${movimiento.concepto}`}
            onPress={onDelete}
            hitSlop={6}
            className="h-8 w-8 items-center justify-center rounded-full bg-[#fdf3f0] active:opacity-70"
          >
            <Ionicons name="trash-outline" size={16} color="#d66a54" />
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}
