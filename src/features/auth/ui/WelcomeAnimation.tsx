import { saludoDelDia } from '@/shared/lib/date';
import { flags } from '@/features/auth/model/flags';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

export function WelcomeIllustration({
  width = 132,
  height = 112,
  darkBg = false,
}: {
  width?: number;
  height?: number;
  darkBg?: boolean;
}) {
  const sceneScale = useSharedValue(0.82);
  const sceneY = useSharedValue(14);
  const stockScale = useSharedValue(0.7);
  const receiptX = useSharedValue(16);
  const receiptOpacity = useSharedValue(0);
  const touchScale = useSharedValue(1);
  const scale = Math.min(width / 220, height / 180);

  useEffect(() => {
    sceneScale.set(withSpring(1, { damping: 15, stiffness: 150 }));
    sceneY.set(withSpring(0, { damping: 15, stiffness: 150 }));
    stockScale.set(withDelay(240, withSpring(1, { damping: 11, stiffness: 190 })));
    receiptX.set(withDelay(390, withSpring(0, { damping: 13, stiffness: 170 })));
    receiptOpacity.set(withDelay(390, withTiming(1, { duration: 240 })));
  }, [receiptOpacity, receiptX, sceneScale, sceneY, stockScale]);

  const sceneStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: sceneY.get() },
      { scale: scale * sceneScale.get() * touchScale.get() },
    ],
  }));
  const stockStyle = useAnimatedStyle(() => ({ transform: [{ scale: stockScale.get() }] }));
  const receiptStyle = useAnimatedStyle(() => ({
    opacity: receiptOpacity.get(),
    transform: [{ translateX: receiptX.get() }, { rotate: '-6deg' }],
  }));

  const triggerBounce = () => {
    touchScale.set(
      withSequence(
        withSpring(1.06, { damping: 9, stiffness: 320 }),
        withSpring(1, { damping: 12, stiffness: 220 }),
      ),
    );
  };

  return (
    <Pressable
      onPress={triggerBounce}
      accessibilityRole="button"
      accessibilityLabel="Ilustración animada de una tienda con una venta completada"
    >
      <View
        style={{ width, height, position: 'relative', alignItems: 'center', justifyContent: 'center' }}
      >
        <Animated.View
          style={[
            {
              position: 'absolute',
              left: (width - 220) / 2,
              top: (height - 180) / 2,
              width: 220,
              height: 180,
            },
            sceneStyle,
          ]}
        >
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: 53,
              top: 23,
              width: 118,
              height: 118,
              borderRadius: 59,
              backgroundColor: darkBg ? 'rgba(244, 202, 125, 0.12)' : 'rgba(47, 128, 107, 0.1)',
            }}
          />
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: 30,
              top: 149,
              width: 164,
              height: 15,
              borderRadius: 99,
              backgroundColor: 'rgba(16, 54, 46, 0.22)',
            }}
          />

          <View
            style={{
              position: 'absolute',
              left: 43,
              top: 42,
              width: 134,
              height: 94,
              borderRadius: 15,
              backgroundColor: '#f8f0df',
              borderWidth: 2,
              borderColor: '#fffaf0',
              shadowColor: '#102d28',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.2,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <View
              style={{
                position: 'absolute',
                left: 10,
                top: 24,
                width: 78,
                height: 57,
                borderRadius: 8,
                backgroundColor: '#c9ded1',
                borderWidth: 3,
                borderColor: '#fffdf5',
                overflow: 'hidden',
              }}
            >
              <View style={{ position: 'absolute', left: 0, right: 0, top: 30, height: 3, backgroundColor: '#fffdf5' }} />
              <View style={{ position: 'absolute', left: 0, right: 0, top: 44, height: 3, backgroundColor: '#fffdf5' }} />
              <View style={{ position: 'absolute', left: 13, bottom: 4, width: 11, height: 15, borderRadius: 4, backgroundColor: '#d88763' }} />
              <View style={{ position: 'absolute', left: 34, bottom: 4, width: 13, height: 19, borderRadius: 5, backgroundColor: '#dfb65e' }} />
              <View style={{ position: 'absolute', right: 9, bottom: 4, width: 12, height: 13, borderRadius: 4, backgroundColor: '#5d9b78' }} />
            </View>
            <View
              style={{
                position: 'absolute',
                right: 10,
                top: 24,
                width: 28,
                height: 57,
                borderTopLeftRadius: 9,
                borderTopRightRadius: 9,
                backgroundColor: '#326f5d',
                borderWidth: 2,
                borderColor: '#fffdf5',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="storefront" size={17} color="#f8e6bd" />
              <View style={{ position: 'absolute', right: 4, top: 29, width: 4, height: 4, borderRadius: 2, backgroundColor: '#f1c56c' }} />
            </View>
          </View>

          <View
            style={{
              position: 'absolute',
              left: 36,
              top: 26,
              width: 148,
              height: 34,
              borderRadius: 12,
              backgroundColor: '#245e50',
              borderWidth: 2,
              borderColor: '#f8f0df',
              flexDirection: 'row',
              overflow: 'hidden',
            }}
          >
            {[0, 1, 2, 3, 4].map((stripe) => (
              <View
                key={stripe}
                style={{
                  flex: 1,
                  backgroundColor: stripe % 2 === 0 ? '#e88763' : '#f6d69a',
                  borderBottomLeftRadius: 9,
                  borderBottomRightRadius: 9,
                  marginHorizontal: 1,
                }}
              />
            ))}
          </View>
          <View
            style={{
              position: 'absolute',
              left: 48,
              top: 65,
              width: 124,
              height: 5,
              borderRadius: 4,
              backgroundColor: '#d9c9a8',
            }}
          />
          <View
            style={{
              position: 'absolute',
              left: 32,
              top: 130,
              width: 156,
              height: 12,
              borderRadius: 6,
              backgroundColor: '#d47f5d',
              borderWidth: 2,
              borderColor: '#f7d8a1',
            }}
          />

          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: 'absolute',
                left: 8,
                top: 41,
                width: 67,
                height: 38,
                paddingHorizontal: 8,
                borderRadius: 13,
                backgroundColor: '#f3cf83',
                borderWidth: 2,
                borderColor: '#fff8e9',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                shadowColor: '#173f39',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 7,
                elevation: 4,
              },
              stockStyle,
            ]}
          >
            <Ionicons name="cube" size={15} color="#214e43" />
            <View>
              <Text style={{ color: '#42604f', fontSize: 7, fontWeight: '800', letterSpacing: 0.7 }}>STOCK</Text>
              <Text style={{ color: '#173f39', fontSize: 12, fontWeight: '900' }}>24</Text>
            </View>
          </Animated.View>

          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: 'absolute',
                right: 4,
                bottom: 13,
                width: 83,
                height: 54,
                paddingHorizontal: 9,
                paddingTop: 7,
                borderRadius: 11,
                backgroundColor: '#fffdf6',
                borderWidth: 1,
                borderColor: '#eedfc4',
                shadowColor: '#173f39',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.18,
                shadowRadius: 8,
                elevation: 5,
              },
              receiptStyle,
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ color: '#587466', fontSize: 7, fontWeight: '900', letterSpacing: 0.6 }}>VENTA LISTA</Text>
              <Ionicons name="checkmark-circle" size={13} color="#348a69" />
            </View>
            <View style={{ height: 3, width: 46, marginTop: 7, borderRadius: 3, backgroundColor: '#d8e6d9' }} />
            <View style={{ height: 3, width: 31, marginTop: 4, borderRadius: 3, backgroundColor: '#f0d7b0' }} />
          </Animated.View>
        </Animated.View>
      </View>
    </Pressable>
  );
}

export function WelcomeWorkspaceBanner({
  nombre,
  negocioNombre,
  cajaHoy,
  jornadaAbierta,
}: {
  nombre: string;
  negocioNombre?: string;
  cajaHoy?: string;
  jornadaAbierta?: boolean;
}) {
  const router = useRouter();
  const [recienLlegado] = useState(() => !flags.welcomeShown);
  const [recienRegistrado] = useState(() => flags.justRegistered);

  const cardScale = useSharedValue(0.97);
  const cardOpacity = useSharedValue(1);
  const badgeTranslate = useSharedValue(8);

  useEffect(() => {
    flags.welcomeShown = true;
    flags.justRegistered = false;

    cardOpacity.set(withTiming(1, { duration: 320 }));
    cardScale.set(withSpring(1, { damping: 16, stiffness: 180 }));
    badgeTranslate.set(withDelay(120, withSpring(0, { damping: 14, stiffness: 200 })));
  }, [badgeTranslate, cardOpacity, cardScale]);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.get(),
    transform: [{ scale: cardScale.get() }],
  }));

  const badgeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: badgeTranslate.get() }],
  }));

  return (
    <Animated.View style={cardAnimatedStyle}>
      <LinearGradient
        colors={['#174942', '#216359', '#2d8274']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 26,
          padding: 18,
          position: 'relative',
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: '#3a9585',
          shadowColor: '#16453e',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.22,
          shadowRadius: 16,
          elevation: 5,
        }}
      >
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            right: -28,
            top: -34,
            width: 150,
            height: 150,
            borderRadius: 999,
            backgroundColor: 'rgba(255, 255, 255, 0.07)',
          }}
        />
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: -20,
            bottom: -40,
            width: 120,
            height: 120,
            borderRadius: 999,
            backgroundColor: 'rgba(243, 207, 131, 0.08)',
          }}
        />

        <View className="flex-row items-center justify-between gap-2">
          <View className="flex-1 gap-1.5 pr-1">
            <Animated.View style={badgeAnimatedStyle}>
              <View className="flex-row items-center gap-1.5 self-start rounded-full border border-[#f3cf83]/30 bg-[#123d37]/80 px-2.5 py-1">
                <Ionicons
                  name={recienRegistrado ? 'rocket' : 'sparkles'}
                  size={12}
                  color="#f3cf83"
                />
                <Text className="text-[10px] font-extrabold uppercase tracking-wider text-[#f3cf83]">
                  {recienRegistrado ? '¡Cuenta lista!' : saludoDelDia()}
                </Text>
              </View>
            </Animated.View>

            <Text className="text-[21px] font-extrabold leading-6 tracking-tight text-white">
              {recienRegistrado
                ? `¡Bienvenido, ${nombre}!`
                : recienLlegado
                  ? `¡Qué gusto verte, ${nombre}!`
                  : `¡Impulsa tu día, ${nombre}!`}
            </Text>

            <Text className="text-xs leading-4.5 text-[#d7ede4]">
              {negocioNombre
                ? `Controlando ${negocioNombre}${cajaHoy ? ` · Caja hoy: ${cajaHoy}` : ''}`
                : 'Crea tu primer negocio para registrar ventas y ganancias.'}
            </Text>
          </View>

          <WelcomeIllustration width={118} height={102} darkBg />
        </View>

        <View className="mt-3.5 flex-row items-center gap-2.5 border-t border-white/15 pt-3">
          <Pressable
            onPress={() => router.push(negocioNombre ? '/caja' : '/negocios')}
            className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl bg-[#f3cf83] px-3 py-2.5 active:opacity-85"
          >
            <Ionicons
              name={negocioNombre ? 'add-circle' : 'storefront'}
              size={16}
              color="#1b433c"
            />
            <Text className="text-xs font-extrabold text-[#1b433c]">
              {negocioNombre
                ? jornadaAbierta
                  ? 'Registrar movimiento'
                  : 'Ir a abrir caja'
                : 'Crear mi negocio'}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/negocios')}
            className="flex-row items-center justify-center gap-1.5 rounded-xl border border-white/25 bg-white/15 px-3.5 py-2.5 active:opacity-80"
          >
            <Ionicons name="storefront-outline" size={15} color="#ffffff" />
            <Text className="text-xs font-bold text-white">Negocios</Text>
          </Pressable>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}
