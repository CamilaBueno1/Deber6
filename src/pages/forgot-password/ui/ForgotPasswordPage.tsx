import AuthShell from '@/shared/ui/AuthShell';
import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';
import { resetRedirectTo } from '@/features/auth/api/auth';
import { aviso, showError } from '@/shared/lib/notify';
import { supabase } from '@/shared/lib/supabase';
import { useRouter } from 'expo-router';
import { useState } from 'react';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const enviar = async () => {
    if (!email.trim()) return aviso('Escribe el correo con el que te registraste.');
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: resetRedirectTo });
      if (error) return showError(error, 'No pudimos enviar el correo');
      aviso('Abre el enlace del correo para crear una nueva contraseña y luego vuelve a StockYa para iniciar sesión.', 'Correo enviado');
      router.replace('/login');
    } catch (error) {
      showError(error, 'No pudimos enviar el correo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Recuperar acceso"
      subtitle="Te enviaremos un enlace para crear una nueva contraseña."
      showWelcomeAnimation
    >
      <Input
        label="Correo electrónico"
        icon="mail-outline"
        placeholder="tucorreo@ejemplo.com"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <Button title="Enviar enlace" variant="dark" icon="paper-plane-outline" onPress={enviar} loading={loading} />
      <Button title="Volver al inicio de sesión" variant="outline" icon="arrow-back-outline" onPress={() => router.back()} />
    </AuthShell>
  );
}
