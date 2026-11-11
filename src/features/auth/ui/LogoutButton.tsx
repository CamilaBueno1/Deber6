import { flags } from '@/features/auth/model/flags';
import { showError } from '@/shared/lib/notify';
import { supabase } from '@/shared/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Button from '@/shared/ui/Button';

/** Botón compacto de "Cerrar sesión" pensado para la esquina del encabezado. Incluye confirmación. */
export default function LogoutButton({ showLabel = false }: { showLabel?: boolean }) {
  const router = useRouter();
  const [confirmar, setConfirmar] = useState(false);
  const [cerrando, setCerrando] = useState(false);
  const [despedida, setDespedida] = useState(false);

  const scale = useSharedValue(1);
  const modalScale = useSharedValue(0.85);
  const modalOpacity = useSharedValue(0);
  const iconShake = useSharedValue(0);

  useEffect(() => {
    if (confirmar) {
      modalScale.set(0.85);
      modalOpacity.set(0);
      modalScale.set(withSpring(1, { damping: 14, stiffness: 220 }));
      modalOpacity.set(withTiming(1, { duration: 200 }));
      iconShake.set(
        withSequence(
          withTiming(-8, { duration: 80 }),
          withTiming(8, { duration: 80 }),
          withSpring(0, { damping: 8, stiffness: 180 }),
        ),
      );
    } else {
      iconShake.set(0);
    }
  }, [confirmar, iconShake, modalOpacity, modalScale]);

  const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  const modalStyle = useAnimatedStyle(() => ({
    opacity: modalOpacity.get(),
    transform: [{ scale: modalScale.get() }],
  }));
  const iconStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${iconShake.get()}deg` }] }));

  const cerrarSesion = async () => {
    setCerrando(true);
    try {
      flags.welcomeShown = false;
      flags.justRegistered = false;
      setDespedida(true);
      await new Promise((resolve) => setTimeout(resolve, 900));
      const { error } = await supabase.auth.signOut();
      if (error) {
        setDespedida(false);
        showError(error, 'No pudimos cerrar sesión');
        return;
      }
      setConfirmar(false);
      router.replace('/login');
    } catch (error) {
      setDespedida(false);
      showError(error, 'No pudimos cerrar sesión');
    } finally {
      setCerrando(false);
    }
  };

  return (
    <>
      <Animated.View style={btnStyle}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cerrar sesión"
          onPress={() => setConfirmar(true)}
          onPressIn={() => {
            scale.set(withSpring(0.9, { damping: 15, stiffness: 320 }));
          }}
          onPressOut={() => {
            scale.set(withSpring(1, { damping: 12, stiffness: 260 }));
          }}
          hitSlop={6}
          className={`h-10 flex-row items-center justify-center gap-1.5 rounded-full border border-[#efc4ba] bg-[#fdf1ed] ${
            showLabel ? 'px-3.5' : 'w-10'
          }`}
          style={{
            shadowColor: '#9e3b27',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 1,
          }}
        >
          <Ionicons name="log-out-outline" size={19} color="#c4533d" />
          {showLabel ? <Text className="text-xs font-extrabold text-[#b84c37]">Salir</Text> : null}
        </Pressable>
      </Animated.View>

      <Modal
        visible={confirmar}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => {
        if (!cerrando) {
          setConfirmar(false);
          setDespedida(false);
        }
        }}
      >
        <View className="flex-1 items-center justify-center bg-[#493A36]/60 px-6">
        <Animated.View style={[{ width: '100%', maxWidth: 380 }, modalStyle]}>
          <View className="w-full items-center gap-3 rounded-[28px] border border-white bg-[#FFFFFF] p-6">
            <Animated.View style={iconStyle}>
              <View className={`h-16 w-16 items-center justify-center rounded-3xl ${despedida ? 'bg-[#F4E7DC]' : 'bg-[#fff1ec]'}`}>
                <Ionicons
                  name={despedida ? 'storefront' : 'log-out'}
                  size={30}
                  color={despedida ? '#D97955' : '#c96850'}
                />
              </View>
            </Animated.View>
            <Text className="text-center text-xl font-extrabold text-[#493A36]">
              {despedida ? '¡Hasta pronto!' : '¿Cerrar sesión ahora?'}
            </Text>
            <Text className="text-center text-sm leading-5 text-[#756B65]">
              {despedida
                ? 'Tu tienda queda guardada y lista para cuando vuelvas.'
                : 'Tus negocios y movimientos quedan guardados en la nube. Podrás volver a entrar cuando quieras.'}
            </Text>
            {!despedida ? (
              <View className="mt-2 w-full gap-2.5">
                <Button
                  title="Sí, cerrar sesión"
                  variant="danger"
                  icon="log-out-outline"
                  onPress={() => void cerrarSesion()}
                  loading={cerrando}
                />
                <Button
                  title="Cancelar"
                  variant="outline"
                  onPress={() => {
                    setConfirmar(false);
                    setDespedida(false);
                  }}
                  disabled={cerrando}
                />
              </View>
            ) : null}
          </View>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}
