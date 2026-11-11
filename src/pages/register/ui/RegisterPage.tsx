import AuthShell from '@/shared/ui/AuthShell';
import Button from '@/shared/ui/Button';
import GoogleButton from '@/features/auth/ui/GoogleButton';
import Input from '@/shared/ui/Input';
import PasswordStrengthBar from '@/shared/ui/PasswordStrengthBar';
import TextLink from '@/shared/ui/TextLink';
import { emailConfirmationRedirectTo, signInWithGoogle } from '@/features/auth/api/auth';
import { flags } from '@/features/auth/model/flags';
import { aviso, showError } from '@/shared/lib/notify';
import { evaluarPassword } from '@/shared/lib/password';
import { supabase } from '@/shared/lib/supabase';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

export default function Register() {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const passwordEvaluation = evaluarPassword(password);

  const registrar = async () => {
    if (!nombre.trim()) return aviso('Escribe tu nombre.');
    if (!email.trim()) return aviso('Escribe tu correo electrónico.');
    if (!passwordEvaluation.valid) return aviso('La contraseña debe tener 8 caracteres, mayúscula, minúscula y número.');
    if (password !== confirm) return aviso('Las dos contraseñas deben ser iguales.');

    setLoading(true);
    try {
      flags.justRegistered = true;
      flags.welcomeShown = false;
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: emailConfirmationRedirectTo,
          data: { full_name: nombre.trim() },
        },
      });
      if (error) return showError(error, 'No pudimos crear tu cuenta');

      if (!data.session) {
        router.replace({ pathname: '/check-email', params: { email: email.trim() } });
      }
    } catch (error) {
      if (error instanceof TypeError && /fetch/i.test(error.message)) {
        showError(
          new Error(
            'No pudimos conectar con Supabase. Verifica que la URL y la clave pública sean del mismo proyecto, que tengas internet y reinicia Expo después de cambiar .env.'
          ),
          'Error de conexión'
        );
        return;
      }
      showError(error, 'No pudimos crear tu cuenta');
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
      title="Crea tu cuenta"
      subtitle="Empieza a llevar las cuentas de tu negocio."
      showWelcomeAnimation
    >
      <View className="w-full gap-4">
        <Input
          label="Tu nombre"
          icon="person-outline"
          placeholder="Ej. María Pérez"
          autoCapitalize="words"
          value={nombre}
          onChangeText={setNombre}
        />
        <Input
          label="Correo electrónico"
          icon="mail-outline"
          placeholder="tucorreo@ejemplo.com"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <View className="gap-2">
          <Input
            label="Contraseña"
            icon="lock-closed-outline"
            placeholder="Mínimo 8 caracteres"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <PasswordStrengthBar password={password} />
        </View>
        <Input
          label="Repite la contraseña"
          icon="shield-checkmark-outline"
          placeholder="Escríbela otra vez"
          secureTextEntry
          value={confirm}
          onChangeText={setConfirm}
        />
        <Button
          title="Crear mi cuenta"
          variant="dark"
          icon="sparkles-outline"
          onPress={registrar}
          loading={loading}
        />
        <View className="gap-3 rounded-[22px] border border-[#ecebe3] bg-[#f8f8f3] p-3.5">
          <View className="flex-row items-center gap-3">
            <View className="h-px flex-1 bg-[#e2ded4]" />
            <Text className="text-[10px] font-bold uppercase tracking-[1.4px] text-[#867A72]">
              O continúa con
            </Text>
            <View className="h-px flex-1 bg-[#e2ded4]" />
          </View>
          <GoogleButton loading={loading} onPress={conGoogle} />
        </View>
        <TextLink prefix="¿Ya tienes cuenta?" label="Inicia sesión" onPress={() => router.replace('/login')} />
      </View>
    </AuthShell>
  );
}
