import Button from '@/shared/ui/Button';
import { supabase } from '@/shared/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

type Estado = 'listo' | 'verificando' | 'exito' | 'error';

const primerValor = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

export default function VerificarCorreoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token_hash?: string | string[]; type?: string | string[] }>();
  const tokenHash = primerValor(params.token_hash);
  const tipo = primerValor(params.type);
  const [estado, setEstado] = useState<Estado>('listo');
  const [mensajeError, setMensajeError] = useState('');
  const [tieneSesion, setTieneSesion] = useState(false);
  const scale = useSharedValue(0.94);

  useEffect(() => {
    scale.set(withSpring(1, { damping: 16, stiffness: 160 }));
  }, [scale]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  const confirmarCorreo = async () => {
    if (!tokenHash || tipo !== 'signup') {
      setMensajeError('El enlace no es válido. Solicita un nuevo correo de confirmación desde StockYa.');
      setEstado('error');
      return;
    }

    setEstado('verificando');
    setMensajeError('');
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: 'signup',
      });
      if (error) throw error;
      setTieneSesion(Boolean(data.session));
      setEstado('exito');
    } catch (error) {
      setMensajeError(
        error instanceof Error
          ? error.message
          : 'El enlace expiró o ya fue utilizado. Solicita uno nuevo desde StockYa.'
      );
      setEstado('error');
    }
  };

  const continuar = () => router.replace(tieneSesion ? '/' : '/login');
  const errorDeEnlace = !tokenHash || tipo !== 'signup';

  return (
    <View className="flex-1 items-center justify-center bg-[#FFFAF5] px-5 py-10">
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          right: -52,
          top: 60,
          width: 180,
          height: 180,
          borderRadius: 90,
          backgroundColor: 'rgba(217,121,85,0.08)',
        }}
      />
      <Animated.View style={[{ width: '100%', maxWidth: 440 }, cardStyle]}>
        <View
          className="items-center gap-4 rounded-[32px] border border-[#fffef8] bg-[#FFF7ED] px-6 py-8"
          style={{
            shadowColor: '#aaa596',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.26,
            shadowRadius: 20,
            elevation: 6,
          }}
        >
          <View className="h-16 w-16 items-center justify-center rounded-[22px] border border-[#fffef8] bg-[#F2E6D9]">
            <Ionicons
              name={estado === 'exito' ? 'checkmark-circle' : estado === 'error' ? 'mail-unread-outline' : 'mail-open-outline'}
              size={32}
              color={estado === 'exito' ? '#D97955' : estado === 'error' ? '#d66a54' : '#8B563D'}
            />
          </View>

          <View className="items-center gap-1">
            <Text className="text-xs font-extrabold uppercase tracking-[2px] text-[#D97955]">
              StockYa
            </Text>
            <Text className="text-center text-2xl font-black text-[#493A36]">
              {estado === 'exito'
                ? '¡Correo confirmado!'
                : estado === 'error'
                  ? 'No pudimos confirmar'
                  : 'Confirma tu correo'}
            </Text>
            <Text className="mt-1 text-center text-sm leading-5 text-[#756B65]">
              {estado === 'exito'
                ? 'Tu cuenta ya está lista. Vuelve a tu tienda y comienza a vender.'
                : estado === 'error'
                  ? mensajeError || 'El enlace venció o ya fue utilizado. Solicita uno nuevo.'
                  : 'Presiona el botón para verificar tu dirección de correo y activar tu cuenta.'}
            </Text>
          </View>

          {estado === 'verificando' ? (
            <View className="flex-row items-center gap-2 rounded-2xl bg-[#F2E6D9] px-4 py-3">
              <ActivityIndicator size="small" color="#8B563D" />
              <Text className="text-sm font-bold text-[#8B563D]">Verificando enlace...</Text>
            </View>
          ) : estado === 'exito' ? (
            <>
              <View className="h-28 w-28 items-center justify-center rounded-full bg-[#F2E6D9]">
                <LottieView
                  source={require('../../../../assets/lottie/success.json')}
                  autoPlay
                  loop={false}
                  style={{ width: 112, height: 112 }}
                  webStyle={{ width: 112, height: 112 }}
                />
              </View>
              <Button
                title={tieneSesion ? 'Entrar a mi tienda' : 'Iniciar sesión'}
                icon="arrow-forward"
                onPress={continuar}
              />
            </>
          ) : estado === 'error' ? (
            <>
              <Button
                title="Ir a StockYa"
                icon="arrow-forward"
                onPress={() => router.replace('/login')}
              />
              <Pressable
                accessibilityRole="button"
                onPress={() => router.replace('/register')}
                className="py-2"
              >
                <Text className="text-sm font-bold text-[#8B563D]">Crear una cuenta nueva</Text>
              </Pressable>
            </>
          ) : (
            <Button
              title={errorDeEnlace ? 'Ir a StockYa' : 'Confirmar mi correo'}
              icon={errorDeEnlace ? 'arrow-forward' : 'shield-checkmark-outline'}
              onPress={errorDeEnlace ? () => router.replace('/login') : confirmarCorreo}
            />
          )}

          <Text className="text-center text-xs text-[#867A72]">
            Si confirmas desde el teléfono, vuelve a la app StockYa para iniciar sesión.
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}
