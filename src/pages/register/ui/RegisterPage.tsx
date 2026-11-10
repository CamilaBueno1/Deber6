import AuthShell from '@/shared/ui/AuthShell';
import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';
import TextLink from '@/shared/ui/TextLink';
import { emailConfirmationRedirectTo } from '@/features/auth/api/auth';
import { flags } from '@/features/auth/model/flags';
import { aviso, showError } from '@/shared/lib/notify';
import { supabase } from '@/shared/lib/supabase';
import { useRouter } from 'expo-router';
import { useState } from 'react';

export default function Register() {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const registrar = async () => {
    if (!nombre.trim()) return aviso('Escribe tu nombre.');
    if (!email.trim()) return aviso('Escribe tu correo electrónico.');
    if (password.length < 6) return aviso('La contraseña debe tener al menos 6 caracteres.');
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

  return (
    <AuthShell
      title="Crea tu cuenta"
      subtitle="Empieza a llevar las cuentas de tu negocio."
      showWelcomeAnimation
    >
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
      <Input
        label="Contraseña"
        icon="lock-closed-outline"
        placeholder="Mínimo 6 caracteres"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
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
      <TextLink prefix="¿Ya tienes cuenta?" label="Inicia sesión" onPress={() => router.replace('/login')} />
    </AuthShell>
  );
}
