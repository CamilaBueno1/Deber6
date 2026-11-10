import Button from '@/shared/ui/Button';
import { money } from '@/shared/lib/format';
import type { Venta } from '@/shared/types';
import { useEffect } from 'react';
import { Modal, Text, View } from 'react-native';
import LottieView from 'lottie-react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

type Props = {
  venta: Venta | null;
  onClose: () => void;
};

export default function VentaExitosaModal({ venta, onClose }: Props) {
  const scale = useSharedValue(0.9);

  useEffect(() => {
    if (venta) {
      scale.set(0.9);
      scale.set(withSpring(1, { damping: 14, stiffness: 200 }));
    }
  }, [scale, venta]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  return (
    <Modal visible={venta !== null} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-[#243b38]/55 px-6">
        <Animated.View style={[{ width: '100%', maxWidth: 380 }, animatedStyle]}>
          <View className="w-full items-center gap-2 rounded-[28px] border border-white bg-[#fffefa] p-6">
            <View className="h-32 w-32 items-center justify-center rounded-full bg-[#e6f0e9]/60">
              <LottieView
                source={require('../../../../assets/lottie/success.json')}
                autoPlay
                loop={false}
                style={{ width: 128, height: 128 }}
                webStyle={{ width: 128, height: 128 }}
              />
            </View>
            <Text className="text-2xl font-extrabold text-[#243b38]">¡Venta registrada!</Text>
            <Text className="text-center text-sm text-[#71817b]">
              {venta?.cantidad} × {venta?.producto_nombre}
            </Text>
            <Text className="my-1 text-4xl font-black text-[#246b61]">
              {money(venta?.total ?? 0)}
            </Text>
            <Text className="mb-2 rounded-full bg-[#eaf3ee] px-3 py-1 text-xs font-bold text-[#246b61]">
              Inventario actualizado
            </Text>
            <Button title="Seguir vendiendo" icon="arrow-forward" onPress={onClose} />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
