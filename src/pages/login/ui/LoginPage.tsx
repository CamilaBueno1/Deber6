import AuthShell from '@/shared/ui/AuthShell';
import Button from '@/shared/ui/Button';
import GoogleButton from '@/features/auth/ui/GoogleButton';
import Input from '@/shared/ui/Input';
import TextLink from '@/shared/ui/TextLink';
import { signInWithGoogle } from '@/features/auth/api/auth';
import { flags } from '@/features/auth/model/flags';
import { aviso, showError } from '@/shared/lib/notify';
import { supabase } from '@/shared/lib/supabase';
import { useRouter } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

function LoginEntrance({ delay, children }: { delay: number; children: ReactNode }) {
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(10);

  useEffect(() => {
    opacity.set(withDelay(delay, withTiming(1, { duration: 280 })));
    translateY.set(withDelay(delay, withSpring(0, { damping: 17, stiffness: 180 })));
  }, [delay, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.get(),
    transform: [{ translateY: translateY.get() }],
  }));

  return <Animated.View style={[{ width: '100%' }, animatedStyle]}>{children}</Animated.View>;
}

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const googleScale = useSharedValue(1);

  const googleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: googleScale.get() }],
  }));

  const iniciarSesion = async () => {
    if (!email.trim() || !password) return aviso('Escribe tu correo y tu contraseña.');
    setLoading(true);
    try {
      flags.welcomeShown = false;
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) showError(error, 'No pudimos iniciar sesión');
    } catch (error) {
      showError(error, 'No pudimos iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const conGoogle = async () => {
    setLoading(true);
    flags.welcomeShown = false;
    try {
      const signedIn = await signInWithGoogle();
      if (!signedIn) flags.welcomeShown = true;
    } catch (error) {
      flags.welcomeShown = true;
      showError(error, 'No pudimos entrar con Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Inicia sesión"
      subtitle="Continúa con la gestión diaria de tu negocio."
      showWelcomeAnimation
    >
      <View className="w-full gap-4">
        <LoginEntrance delay={80}>
          <Input
            label="Correo electrónico"
            icon="mail-outline"
            placeholder="tucorreo@ejemplo.com"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </LoginEntrance>

        <LoginEntrance delay={150}>
          <View className="gap-1.5">
            <Input
              label="Contraseña"
              icon="lock-closed-outline"
              placeholder="Tu contraseña"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <TextLink
              label="¿Olvidaste tu contraseña?"
              onPress={() => router.push('/forgot-password')}
              className="items-end"
            />
          </View>
        </LoginEntrance>

        <LoginEntrance delay={220}>
          <Button
            title="Iniciar sesión"
            variant="dark"
            icon="log-in-outline"
            onPress={iniciarSesion}
            loading={loading}
          />
        </LoginEntrance>

        <LoginEntrance delay={300}>
          <View className="gap-3 rounded-[22px] border border-[#ecebe3] bg-[#f8f8f3] p-3.5">
            <View className="flex-row items-center gap-3">
              <View className="h-px flex-1 bg-[#e2ded4]" />
              <Text className="text-[10px] font-bold uppercase tracking-[1.4px] text-[#867A72]">
                O continúa con
              </Text>
              <View className="h-px flex-1 bg-[#e2ded4]" />
            </View>

            <Animated.View style={googleAnimatedStyle}>
              <GoogleButton loading={loading} onPress={conGoogle} />
            </Animated.View>
          </View>
        </LoginEntrance>

        <LoginEntrance delay={380}>
          <View className="items-center border-t border-[#eeeae0] pt-3">
            <TextLink
              prefix="¿Eres nuevo?"
              label="Crea tu cuenta gratis"
              onPress={() => router.push('/register')}
            />
          </View>
        </LoginEntrance>
      </View>
    </AuthShell>
  );
}
