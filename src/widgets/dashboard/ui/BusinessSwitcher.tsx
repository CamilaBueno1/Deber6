import { iconoNegocio } from '@/shared/config/movimientos';
import { useNegocio } from '@/features/business-management/model/NegocioContext';
import type { Negocio } from '@/shared/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

function BusinessPill({
  negocio,
  activo,
  onSelect,
}: {
  negocio: Negocio;
  activo: boolean;
  onSelect: () => void;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onSelect}
        onPressIn={() => {
          scale.set(withSpring(0.94, { damping: 15, stiffness: 300 }));
        }}
        onPressOut={() => {
          scale.set(withSpring(1, { damping: 14, stiffness: 260 }));
        }}
        className={`flex-row items-center gap-2 rounded-full border px-3.5 py-2 ${
          activo ? 'border-[#D97955] bg-[#D97955]' : 'border-[#EFE3DA] bg-[#FFFFFF]'
        }`}
        style={
          activo
            ? {
                shadowColor: '#8B563D',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.2,
                shadowRadius: 6,
                elevation: 2,
              }
            : undefined
        }
      >
        <Ionicons name={iconoNegocio(negocio.emoji)} size={16} color={activo ? '#ffffff' : '#8B563D'} />
        <Text className={`text-xs font-bold ${activo ? 'text-white' : 'text-[#6D5A52]'}`}>
          {negocio.nombre}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export default function BusinessSwitcher() {
  const router = useRouter();
  const { negocios, selected, select } = useNegocio();
  const newScale = useSharedValue(1);

  const newStyle = useAnimatedStyle(() => ({
    transform: [{ scale: newScale.get() }],
  }));

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 pt-3.5">
      {negocios.map((n) => (
        <BusinessPill
          key={n.id}
          negocio={n}
          activo={selected?.id === n.id}
          onSelect={() => select(n.id)}
        />
      ))}
      <Animated.View style={newStyle}>
        <Pressable
          onPress={() => router.push('/negocios')}
          onPressIn={() => {
            newScale.set(withSpring(0.94, { damping: 15, stiffness: 300 }));
          }}
          onPressOut={() => {
            newScale.set(withSpring(1, { damping: 14, stiffness: 260 }));
          }}
          className="flex-row items-center gap-1 rounded-full border border-dashed border-[#D97955] bg-[#FFF1E8] px-3.5 py-2"
        >
          <Ionicons name="add-circle-outline" size={16} color="#8B563D" />
          <Text className="text-xs font-bold text-[#8B563D]">Nuevo</Text>
        </Pressable>
      </Animated.View>
    </ScrollView>
  );
}
