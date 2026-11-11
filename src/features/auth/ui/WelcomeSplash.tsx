import { saludoDelDia } from '@/shared/lib/date';
import { WelcomeIllustration } from './WelcomeAnimation';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

type Props = {
  visible: boolean;
  nombre: string;
  recienRegistrado?: boolean;
  onDone: () => void;
};

const DURACION = 2400;

/** Pantalla de bienvenida animada que se cierra sola o al tocar "Comenzar". */
export default function WelcomeSplash({ visible, nombre, recienRegistrado, onDone }: Props) {
  const cerrado = useRef(false);

  const overlay = useSharedValue(1);
  const sceneScale = useSharedValue(0.8);
  const titleY = useSharedValue(24);
  const titleO = useSharedValue(1);
  const subO = useSharedValue(1);
  const btnO = useSharedValue(1);
  const btnY = useSharedValue(16);
  const progress = useSharedValue(0);
  const sparkleY = useSharedValue(0);

  const cerrar = () => {
    if (cerrado.current) return;
    cerrado.current = true;
    cancelAnimation(sparkleY);
    overlay.set(withTiming(0, { duration: 380, easing: Easing.out(Easing.quad) }));
    setTimeout(onDone, 400);
  };

  useEffect(() => {
    if (!visible) return;
    cerrado.current = false;
    overlay.set(1);
    sceneScale.set(withSpring(1, { damping: 13, stiffness: 150 }));
    titleO.set(withDelay(220, withTiming(1, { duration: 360 })));
    titleY.set(withDelay(220, withSpring(0, { damping: 14, stiffness: 160 })));
    subO.set(withDelay(420, withTiming(1, { duration: 360 })));
    btnO.set(withDelay(560, withTiming(1, { duration: 340 })));
    btnY.set(withDelay(560, withSpring(0, { damping: 14, stiffness: 170 })));
    progress.set(withTiming(100, { duration: DURACION, easing: Easing.linear }));
    sparkleY.set(
      withRepeat(
        withSequence(withTiming(-7, { duration: 700 }), withTiming(0, { duration: 700 })),
        -1,
      ),
    );

    const timer = setTimeout(() => cerrar(), DURACION);
    return () => {
      clearTimeout(timer);
      cancelAnimation(sparkleY);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlay.get(),
    transform: [{ scale: 1 + (1 - overlay.get()) * 0.06 }],
  }));
  const sceneStyle = useAnimatedStyle(() => ({ transform: [{ scale: sceneScale.get() }] }));
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleO.get(),
    transform: [{ translateY: titleY.get() }],
  }));
  const subStyle = useAnimatedStyle(() => ({ opacity: subO.get() }));
  const btnStyle = useAnimatedStyle(() => ({
    opacity: btnO.get(),
    transform: [{ translateY: btnY.get() }],
  }));
  const progressStyle = useAnimatedStyle(() => ({ width: `${progress.get()}%` }));
  const sparkleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sparkleY.get() }],
  }));

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={cerrar}>
      <Animated.View style={[{ flex: 1 }, overlayStyle]}>
        <LinearGradient
          colors={['#FFF6EC', '#FFE9DB', '#F8E2D9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 }}
        >
          <View style={{ width: 248, height: 194, alignItems: 'center', justifyContent: 'center' }}>
            <Animated.View style={sceneStyle}>
              <WelcomeIllustration width={210} height={180} darkBg />
            </Animated.View>
            <Animated.View
              pointerEvents="none"
              style={[{ position: 'absolute', top: 8, right: 20 }, sparkleStyle]}
            >
              <Ionicons name="sparkles" size={23} color="#E99B79" />
            </Animated.View>
            <Animated.View
              pointerEvents="none"
              style={[{ position: 'absolute', bottom: 20, left: 16 }, sparkleStyle]}
            >
              <Ionicons name="heart" size={17} color="#E9B66D" />
            </Animated.View>
          </View>

          <Animated.View style={titleStyle}>
            <View className="items-center gap-2">
              <View className="flex-row items-center gap-1.5 rounded-full border border-[#E8B99B] bg-white/70 px-3 py-1">
                <Ionicons name={recienRegistrado ? 'rocket' : 'sunny'} size={13} color="#A95743" />
                <Text className="text-[11px] font-extrabold uppercase tracking-widest text-[#8B5147]">
                  {recienRegistrado ? 'Cuenta creada' : saludoDelDia()}
                </Text>
              </View>
              <Text className="text-center text-[30px] font-extrabold leading-9 tracking-tight text-[#493A36]">
                {recienRegistrado ? '¡Bienvenido a bordo,' : '¡Bienvenido de nuevo,'}
                {'\n'}
                {nombre}!
              </Text>
            </View>
          </Animated.View>

          <Animated.View style={subStyle}>
            <Text className="mt-3 max-w-xs text-center text-sm leading-5 text-[#765F57]">
              Tu negocio tiene pulso. Revisa tus ventas, controla tu caja y sigue creciendo hoy.
            </Text>
          </Animated.View>

          <Animated.View style={[{ width: '100%', maxWidth: 320, marginTop: 28 }, btnStyle]}>
            <Pressable
              onPress={cerrar}
              accessibilityRole="button"
              className="flex-row items-center justify-center gap-2 rounded-2xl bg-[#E99B79] py-4 active:opacity-85"
              style={{
                shadowColor: '#A95743',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.2,
                shadowRadius: 10,
                elevation: 5,
              }}
            >
              <Text className="text-base font-extrabold text-[#493A36]">Comenzar</Text>
              <Ionicons name="arrow-forward" size={18} color="#493A36" />
            </Pressable>
            <View className="mt-4 h-1 w-full overflow-hidden rounded-full bg-[#E8D2C6]">
              <Animated.View
                style={[{ height: '100%', backgroundColor: '#D97955', borderRadius: 99 }, progressStyle]}
              />
            </View>
          </Animated.View>
        </LinearGradient>
      </Animated.View>
    </Modal>
  );
}
