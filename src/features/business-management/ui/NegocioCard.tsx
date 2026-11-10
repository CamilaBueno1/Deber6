import { iconoNegocio } from '@/shared/config/movimientos';
import { money } from '@/shared/lib/format';
import type { Negocio } from '@/shared/types';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Card from '@/shared/ui/Card';

type Props = {
  negocio: Negocio;
  activo: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export default function NegocioCard({ negocio, activo, onSelect, onEdit, onDelete }: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onSelect}
        onPressIn={() => {
          scale.set(withSpring(0.975, { damping: 15, stiffness: 280 }));
        }}
        onPressOut={() => {
          scale.set(withSpring(1, { damping: 14, stiffness: 250 }));
        }}
      >
        <Card
          className={`flex-row items-center gap-3.5 ${
            activo ? 'border-2 border-[#348a76] bg-[#fafdf9]' : ''
          }`}
        >
          <View
            className={`h-12 w-12 items-center justify-center rounded-2xl ${
              activo ? 'bg-[#246b61]' : 'bg-[#e6f0e9]'
            }`}
          >
            <Ionicons
              name={iconoNegocio(negocio.emoji)}
              size={23}
              color={activo ? '#ffffff' : '#246b61'}
            />
          </View>
          <View className="flex-1 gap-0.5">
            <View className="flex-row items-center gap-2">
              <Text className="text-base font-bold text-[#243b38]" numberOfLines={1}>
                {negocio.nombre}
              </Text>
              {activo ? (
                <View className="rounded-full bg-[#e6f0e9] px-2 py-0.5">
                  <Text className="text-[10px] font-extrabold uppercase text-[#246b61]">Activo</Text>
                </View>
              ) : null}
            </View>
            <Text className="text-xs text-[#71817b]">
              {negocio.rubro || 'Emprendimiento'} · Capital {money(negocio.capital_inicial)}
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Editar ${negocio.nombre}`}
              onPress={onEdit}
              hitSlop={8}
              className="h-9 w-9 items-center justify-center rounded-full bg-[#f4efe4] active:opacity-70"
            >
              <Ionicons name="create-outline" size={18} color="#5d706c" />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Eliminar ${negocio.nombre}`}
              onPress={onDelete}
              hitSlop={8}
              className="h-9 w-9 items-center justify-center rounded-full bg-[#fdf3f0] active:opacity-70"
            >
              <Ionicons name="trash-outline" size={18} color="#d66a54" />
            </Pressable>
          </View>
        </Card>
      </Pressable>
    </Animated.View>
  );
}
