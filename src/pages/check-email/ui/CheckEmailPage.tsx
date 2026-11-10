import AuthShell from '@/shared/ui/AuthShell';
import Button from '@/shared/ui/Button';
import { emailConfirmationRedirectTo } from '@/features/auth/api/auth';
import { aviso, showError } from '@/shared/lib/notify';
import { supabase } from '@/shared/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

export default function CheckEmail() {
  const router = useRouter();
  const { email: emailParam } = useLocalSearchParams<{ email?: string }>();
  const email = typeof emailParam === 'string' ? emailParam : '';
  const [loading, setLoading] = useState(false);

  const reenviar = async () => {
    if (!email) {
      aviso('Vuelve al registro para indicar tu correo electrónico.');
      router.replace('/register');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: { emailRedirectTo: emailConfirmationRedirectTo },
      });
      if (error) return showError(error, 'No pudimos reenviar el correo');
      aviso('Revisa tu bandeja de entrada y la carpeta de spam.', 'Correo reenviado');
    } catch (error) {
      showError(error, 'No pudimos reenviar el correo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Revisa tu correo"
      subtitle="Te enviamos un enlace seguro para activar tu cuenta."
      showWelcomeAnimation
    >
      <View className="items-center gap-3 py-2">
        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-[#e6f0e9]">
          <Ionicons name="mail-open-outline" size={28} color="#246b61" />
        </View>
        <Text className="text-center text-base font-bold text-[#243b38]">
          {email || 'Abre el mensaje de confirmación que te enviamos.'}
        </Text>
        <Text className="text-center text-sm leading-5 text-[#71817b]">
          Abre el enlace de confirmación en el navegador y pulsa Confirmar. Después vuelve a
          StockYa e inicia sesión. Si no llega, revisa spam: el SMTP de prueba de Supabase solo
          entrega a correos autorizados del equipo y tiene un límite de envíos. Para usar Gmail
          u otros destinatarios, configura SMTP personalizado en Supabase.
        </Text>
      </View>
      <Button title="Reenviar correo" onPress={reenviar} loading={loading} icon="mail-outline" />
      <Button
        title="Volver al inicio de sesión"
        variant="outline"
        icon="arrow-back-outline"
        onPress={() => router.replace('/login')}
      />
    </AuthShell>
  );
}
