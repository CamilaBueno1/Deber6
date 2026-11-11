import { colors } from '@/shared/config/theme';
import { money } from '@/shared/lib/format';
import LottieView from 'lottie-react-native';
import { useEffect } from 'react';
import { Modal, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Button from '@/shared/ui/Button';

type Props = {
  visible: boolean;
  resultadoOperativo: number | null;
  ventasSinCosto: number;
  cajaFinal: number;
  onClose: () => void;
};

export default function CloseDayModal({
  visible,
  resultadoOperativo,
  ventasSinCosto,
  cajaFinal,
  onClose,
}: Props) {
  const scale = useSharedValue(0.88);

  useEffect(() => {
    if (visible) {
      scale.set(0.88);
      scale.set(withSpring(1, { damping: 14, stiffness: 200 }));
    }
  }, [scale, visible]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-[#493A36]/55 px-6">
        <Animated.View style={[{ width: '100%', maxWidth: 380 }, cardStyle]}>
          <View className="w-full items-center gap-2 rounded-[28px] border border-white bg-[#FFFFFF] p-6">
            <View className="h-32 w-32 items-center justify-center rounded-full bg-[#F4E7DC]/50">
              <LottieView
                source={require('../../../../assets/lottie/success.json')}
                autoPlay
                loop={false}
                style={{ width: 128, height: 128 }}
                webStyle={{ width: 128, height: 128 }}
              />
            </View>
            <Text className="text-2xl font-extrabold text-[#493A36]">¡Jornada cerrada!</Text>
            <Text className="text-sm text-[#756B65]">Resultado operativo registrado</Text>
            {resultadoOperativo === null ? (
              <Text className="text-center text-base font-bold text-[#9a6b19]">
                {ventasSinCosto > 0
                  ? `Pendiente: faltan costos directos de ${ventasSinCosto} venta${ventasSinCosto === 1 ? '' : 's'}`
                  : 'No hubo ventas para calcular un resultado'}
              </Text>
            ) : (
              <Text
                className="text-4xl font-black"
                style={{ color: resultadoOperativo >= 0 ? colors.brand : colors.danger }}
              >
                {resultadoOperativo >= 0 ? '+' : ''}
                {money(resultadoOperativo)}
              </Text>
            )}
            <View className="my-2 w-full rounded-2xl bg-[#F8EDE0] px-4 py-3">
              <Text className="text-center text-sm font-semibold text-[#6E625C]">
                Efectivo final en caja:{' '}
                <Text className="font-extrabold text-[#493A36]">{money(cajaFinal)}</Text>
              </Text>
            </View>
            <Button
              title="Excelente, entendido"
              icon="checkmark-circle-outline"
              onPress={onClose}
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
