import Button from '@/shared/ui/Button';
import { money } from '@/shared/lib/format';
import type { Venta } from '@/shared/types';
import { useEffect } from 'react';
import { Modal, Text, View } from 'react-native';
import LottieView from 'lottie-react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

type Props = {
  venta: Venta[] | null;
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
      <View className="flex-1 items-center justify-center bg-[#493A36]/55 px-6">
        <Animated.View style={[{ width: '100%', maxWidth: 380 }, animatedStyle]}>
          <View className="w-full items-center gap-2 rounded-[28px] border border-white bg-[#FFFFFF] p-6">
            <View className="h-32 w-32 items-center justify-center rounded-full bg-[#F4E7DC]/60">
              <LottieView
                source={require('../../../../assets/lottie/success.json')}
                autoPlay
                loop={false}
                style={{ width: 128, height: 128 }}
                webStyle={{ width: 128, height: 128 }}
              />
            </View>
            <Text className="text-2xl font-extrabold text-[#493A36]">¡Venta registrada!</Text>
            <View className="max-h-28 w-full gap-1">
              {venta?.[0]?.metodo_pago ? (
                <Text className="text-center text-xs text-[#756B65]">
                  Pago por {venta[0].metodo_pago === 'efectivo' ? 'efectivo' : 'transferencia'}
                </Text>
              ) : null}
              {venta?.[0]?.cliente ? (
                <Text className="text-center text-xs font-semibold text-[#756B65]">
                  Cliente: {venta[0].cliente}
                </Text>
              ) : null}
              {venta?.map((linea) => (
                <Text key={linea.id} className="text-center text-xs text-[#756B65]" numberOfLines={1}>
                  {linea.cantidad} × {linea.producto_nombre}
                </Text>
              ))}
            </View>
            <Text className="my-1 text-4xl font-black text-[#8B563D]">
              {money(venta?.reduce((total, linea) => total + linea.total, 0) ?? 0)}
            </Text>
            <Text className="mb-2 rounded-full bg-[#F5E9E1] px-3 py-1 text-xs font-bold text-[#8B563D]">
              Inventario actualizado
            </Text>
            <Button title="Seguir vendiendo" icon="arrow-forward" onPress={onClose} />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
